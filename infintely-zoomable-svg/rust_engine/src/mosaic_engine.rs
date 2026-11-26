//! VectorForge Parallel Perceptual Watershed + Gradient Mosaic Engine.
//!
//! Designed for crystal-clear photographic & artwork vectorization:
//! 1. Optical unsharp sharpening (restores lens/downscale micro-contrast without ringing).
//! 2. Perceptual luminance-weighted Kruskal Watershed hierarchy (O(N alpha(N))).
//! 3. Color-midpoint boundary snapping on AA ramps (eliminates jagged noise boundaries).
//! 4. Exact topological BoundaryGraph + Rayon-parallel cubic Bézier segment fitting
//!    with tight error tolerance (no blurry curve ballooning).
//! 5. Per-region Clamped 2D Linear Color Gradients (<linearGradient>) eliminating flat
//!    posterization bands while keeping high-frequency edges razor sharp.

use std::collections::BTreeMap;
use rayon::prelude::*;
use visioncortex::{Color, PathF64, PathI32, PathSimplify, PointF64, PointI32, SubdivideSmooth};

// ---------------------------------------------------------------------------
// 1. Optical Sharpening & Pre-processing
// ---------------------------------------------------------------------------

/// Fast Rayon-parallel 3x3 unsharp mask to sharpen soft camera/downscaled edges cleanly.
pub fn optical_sharpen(rgba: &[u8], width: usize, height: usize, amount: f32) -> Vec<u8> {
    if width < 3 || height < 3 || rgba.len() != width * height * 4 || amount <= 0.0 {
        return rgba.to_vec();
    }
    let mut out = vec![0u8; width * height * 4];
    let stride = width * 4;

    out.par_chunks_mut(stride)
        .enumerate()
        .for_each(|(y, row)| {
            if y == 0 || y + 1 == height {
                let src = &rgba[y * stride..(y + 1) * stride];
                row.copy_from_slice(src);
                return;
            }
            let prev = &rgba[(y - 1) * stride..y * stride];
            let curr = &rgba[y * stride..(y + 1) * stride];
            let next = &rgba[(y + 1) * stride..(y + 2) * stride];

            // Copy left edge pixel
            row[0..4].copy_from_slice(&curr[0..4]);
            for x in 1..(width - 1) {
                let i = x * 4;
                let a = curr[i + 3];
                if a < 8 {
                    row[i..i + 4].copy_from_slice(&curr[i..i + 4]);
                    continue;
                }
                for ch in 0..3 {
                    let blur = (prev[i - 4 + ch] as i32
                        + 2 * prev[i + ch] as i32
                        + prev[i + 4 + ch] as i32
                        + 2 * curr[i - 4 + ch] as i32
                        + 4 * curr[i + ch] as i32
                        + 2 * curr[i + 4 + ch] as i32
                        + next[i - 4 + ch] as i32
                        + 2 * next[i + ch] as i32
                        + next[i + 4 + ch] as i32) as f32
                        / 16.0;
                    let c = curr[i + ch] as f32;
                    // Dampen sharpening in near-flat sensor noise zones to avoid amplifying grain
                    let diff = c - blur;
                    let gain = if diff.abs() < 3.0 {
                        amount * 0.25
                    } else {
                        amount
                    };
                    row[i + ch] = (c + gain * diff).round().clamp(0.0, 255.0) as u8;
                }
                row[i + 3] = a;
            }
            // Copy right edge pixel
            let last = (width - 1) * 4;
            row[last..last + 4].copy_from_slice(&curr[last..last + 4]);
        });

    out
}

// ---------------------------------------------------------------------------
// 2. Perceptual Watershed Segmentation
// ---------------------------------------------------------------------------

struct Uf(Vec<u32>);

impl Uf {
    #[inline]
    fn new(n: usize) -> Self {
        Self((0..n as u32).collect())
    }
    #[inline]
    fn find(&mut self, mut x: u32) -> u32 {
        while self.0[x as usize] != x {
            self.0[x as usize] = self.0[self.0[x as usize] as usize];
            x = self.0[x as usize];
        }
        x
    }
    #[inline]
    fn link(&mut self, a: u32, b: u32) {
        self.0[b as usize] = a;
    }
}

/// Luminance-weighted perceptual edge weight in `0..=255`.
/// Gives extra sensitivity to brightness contours (eyelashes, pupils, shadows, text)
/// so subtle dark lines do not collapse into adjacent lighter skin tones.
#[inline]
fn perceptual_edge_weight(rgba: &[u8], i: usize, j: usize) -> u8 {
    let ai = i * 4;
    let aj = j * 4;
    let a0 = rgba[ai + 3];
    let a1 = rgba[aj + 3];
    if (a0 < 32) != (a1 < 32) {
        return 255;
    }
    if a0 < 32 && a1 < 32 {
        return 0;
    }
    let dr = (rgba[ai] as i32 - rgba[aj] as i32).abs();
    let dg = (rgba[ai + 1] as i32 - rgba[aj + 1] as i32).abs();
    let db = (rgba[ai + 2] as i32 - rgba[aj + 2] as i32).abs();
    // Weighted perceptual delta (luma 65% + max chroma 35%)
    let dy_num = (77 * dr + 150 * dg + 29 * db) >> 8; // ~ luminance diff
    let cmax = dr.max(dg).max(db);
    let score = (dy_num * 3 + cmax * 2) / 4;
    score.clamp(0, 255) as u8
}

pub struct WatershedPartition {
    pub width: usize,
    pub height: usize,
    pub labels: Vec<u32>,
    pub region_count: usize,
    pub paints: Vec<Color>,
    pub mean_backdrop: Color,
}

pub const OUTSIDE: u32 = u32::MAX;

/// Build perceptual watershed hierarchy and cut directly into clean 8-connected region IDs.
pub fn segment_perceptual_watershed(
    rgba: &[u8],
    width: usize,
    height: usize,
    target_regions: usize,
    min_area: usize,
) -> WatershedPartition {
    let n = width * height;
    if n <= 1 {
        let c = if n == 1 {
            Color::new(rgba[0], rgba[1], rgba[2])
        } else {
            Color::new(0, 0, 0)
        };
        return WatershedPartition {
            width,
            height,
            labels: vec![0; n],
            region_count: n,
            paints: if n == 1 { vec![c] } else { vec![] },
            mean_backdrop: c,
        };
    }

    // Step 1: 4-adjacency edges, counting-sorted by perceptual weight
    let mut counts = [0u32; 256];
    let mut weight_of = vec![0u8; 2 * n];
    for y in 0..height {
        for x in 0..width {
            let i = y * width + x;
            if x + 1 < width {
                let wgt = perceptual_edge_weight(rgba, i, i + 1);
                weight_of[2 * i] = wgt;
                counts[wgt as usize] += 1;
            }
            if y + 1 < height {
                let wgt = perceptual_edge_weight(rgba, i, i + width);
                weight_of[2 * i + 1] = wgt;
                counts[wgt as usize] += 1;
            }
        }
    }

    let n_edges: usize = counts.iter().map(|&c| c as usize).sum();
    let mut start = [0usize; 256];
    let mut acc = 0usize;
    for b in 0..256 {
        start[b] = acc;
        acc += counts[b] as usize;
    }
    let mut sorted = vec![0u32; n_edges];
    let mut fill = start;
    for y in 0..height {
        for x in 0..width {
            let i = y * width + x;
            if x + 1 < width {
                let e = 2 * i;
                let b = weight_of[e] as usize;
                sorted[fill[b]] = e as u32;
                fill[b] += 1;
            }
            if y + 1 < height {
                let e = 2 * i + 1;
                let b = weight_of[e] as usize;
                sorted[fill[b]] = e as u32;
                fill[b] += 1;
            }
        }
    }

    // Step 2: Kruskal MST -> Binary Partition Tree
    let n_nodes = 2 * n - 1;
    let mut parent = vec![u32::MAX; n_nodes];
    let mut alt = vec![0u8; n_nodes];
    let mut child = vec![[0u32; 2]; n - 1];
    let mut mst = vec![(0u32, 0u32); n - 1];
    let mut uf = Uf::new(n);
    let mut comp_node: Vec<u32> = (0..n as u32).collect();
    let mut next = n as u32;

    for &e in &sorted {
        let p = (e / 2) as usize;
        let q = if e % 2 == 0 { p + 1 } else { p + width };
        let (rp, rq) = (uf.find(p as u32), uf.find(q as u32));
        if rp == rq {
            continue;
        }
        let k = (next - n as u32) as usize;
        alt[next as usize] = weight_of[e as usize];
        child[k] = [comp_node[rp as usize], comp_node[rq as usize]];
        mst[k] = (p as u32, q as u32);
        parent[comp_node[rp as usize] as usize] = next;
        parent[comp_node[rq as usize] as usize] = next;
        uf.link(rp, rq);
        comp_node[rp as usize] = next;
        next += 1;
    }

    // Step 3: Volume extinction persistence
    let root = n_nodes - 1;
    let mut area = vec![0u64; n_nodes];
    for a in area.iter_mut().take(n) {
        *a = 1;
    }
    let mut volume = vec![0u64; n_nodes];
    for i in 0..root {
        let pa = parent[i] as usize;
        area[pa] += area[i];
        let rise = (alt[pa] - alt[i]) as u64;
        volume[i] += area[i] * rise;
        volume[pa] += volume[i];
    }
    let mut corrected = volume;
    for i in n..n_nodes {
        let k = i - n;
        if i != root && alt[i] == alt[parent[i] as usize] {
            let [c0, c1] = child[k];
            corrected[i] = corrected[c0 as usize].max(corrected[c1 as usize]);
        }
    }
    let mut pers = vec![0u64; n - 1];
    for k in 0..n - 1 {
        let [c0, c1] = child[k];
        pers[k] = corrected[c0 as usize].min(corrected[c1 as usize]);
    }
    let mut order: Vec<u32> = (0..(n - 1) as u32).collect();
    order.sort_unstable_by_key(|&k| (pers[k as usize], k));

    // Step 4: Cut hierarchy at adaptive region target
    let m = mst.len();
    let mut uf_cut = Uf::new(n);
    if m > 0 {
        let target = target_regions.clamp(1, m);
        let lambda = pers[order[m - target] as usize];
        for &k in &order {
            if pers[k as usize] > lambda {
                break;
            }
            let (p, q) = mst[k as usize];
            let (rp, rq) = (uf_cut.find(p), uf_cut.find(q));
            if rp != rq {
                uf_cut.link(rp, rq);
            }
        }
    }

    let mut pre_of_root = vec![u32::MAX; n];
    let mut labels = vec![0u32; n];
    let mut kp = 0usize;
    for i in 0..n {
        let r = uf_cut.find(i as u32) as usize;
        if pre_of_root[r] == u32::MAX {
            pre_of_root[r] = kp as u32;
            kp += 1;
        }
        labels[i] = pre_of_root[r];
    }

    let mut reg_area = vec![0u64; kp];
    let mut reg_sum = vec![[0u64; 3]; kp];
    let mut total_sum = [0u64; 3];
    for i in 0..n {
        let a = labels[i] as usize;
        let idx = i * 4;
        reg_area[a] += 1;
        reg_sum[a][0] += rgba[idx] as u64;
        reg_sum[a][1] += rgba[idx + 1] as u64;
        reg_sum[a][2] += rgba[idx + 2] as u64;
        total_sum[0] += rgba[idx] as u64;
        total_sum[1] += rgba[idx + 1] as u64;
        total_sum[2] += rgba[idx + 2] as u64;
    }
    let mean_backdrop = Color::new(
        (total_sum[0] / n as u64) as u8,
        (total_sum[1] / n as u64) as u8,
        (total_sum[2] / n as u64) as u8,
    );

    // Step 5: AA ramp midpoint boundary snapping (keeps edges razor crisp without stair wobble)
    snap_boundaries_rgba(rgba, width, height, &mut labels, &mut reg_area, &mut reg_sum);

    // Step 6: Absorb tiny dust specks while protecting high-contrast details
    if min_area > 1 {
        let mut pairs: Vec<(u32, u32)> = Vec::with_capacity(n / 4);
        for y in 0..height {
            for x in 0..width {
                let i = y * width + x;
                let a = labels[i];
                if x + 1 < width && labels[i + 1] != a {
                    pairs.push((a, labels[i + 1]));
                }
                if y + 1 < height && labels[i + width] != a {
                    pairs.push((a, labels[i + width]));
                }
            }
        }
        let mut uf_r = Uf::new(kp);
        absorb_small_contrast_aware(min_area, &pairs, &mut uf_r, &mut reg_area, &mut reg_sum);
        for l in &mut labels {
            *l = uf_r.find(*l);
        }
    }

    // Step 7: Split into dense 8-connected island IDs so EVERY connected component
    // has its own unique RegionId (1:1 mapping with its gradient fill & contours!)
    let mut final_labels = vec![OUTSIDE; n];
    let mut next_id = 0u32;
    let mut stack: Vec<(usize, usize)> = Vec::new();
    let mut paints: Vec<Color> = Vec::new();

    for s in 0..n {
        if final_labels[s] != OUTSIDE {
            continue;
        }
        if rgba[s * 4 + 3] < 32 {
            // Transparent pixel remains OUTSIDE
            continue;
        }
        let old_lbl = labels[s];
        let id = next_id;
        next_id += 1;
        final_labels[s] = id;
        stack.push((s % width, s / width));

        let mut sr = 0u64;
        let mut sg = 0u64;
        let mut sb = 0u64;
        let mut cnt = 0u64;

        while let Some((x, y)) = stack.pop() {
            let p = y * width + x;
            let pi = p * 4;
            sr += rgba[pi] as u64;
            sg += rgba[pi + 1] as u64;
            sb += rgba[pi + 2] as u64;
            cnt += 1;

            for dy in -1isize..=1 {
                for dx in -1isize..=1 {
                    if dx == 0 && dy == 0 {
                        continue;
                    }
                    let nx = x as isize + dx;
                    let ny = y as isize + dy;
                    if nx < 0 || ny < 0 || nx >= width as isize || ny >= height as isize {
                        continue;
                    }
                    let ni = ny as usize * width + nx as usize;
                    if final_labels[ni] == OUTSIDE && labels[ni] == old_lbl && rgba[ni * 4 + 3] >= 32
                    {
                        final_labels[ni] = id;
                        stack.push((nx as usize, ny as usize));
                    }
                }
            }
        }
        let c = cnt.max(1);
        paints.push(Color::new((sr / c) as u8, (sg / c) as u8, (sb / c) as u8));
    }

    WatershedPartition {
        width,
        height,
        labels: final_labels,
        region_count: next_id as usize,
        paints,
        mean_backdrop,
    }
}

fn snap_boundaries_rgba(
    rgba: &[u8],
    w: usize,
    h: usize,
    labels: &mut [u32],
    area: &mut [u64],
    sum: &mut [[u64; 3]],
) {
    let n = w * h;
    let k = area.len();
    if k < 2 {
        return;
    }
    const SNAP_SWEEPS: usize = 3;
    const SNAP_SLACK: i32 = 16;

    let snap_target = |i: usize, labels: &[u32], mean: &[[i32; 3]]| -> Option<u32> {
        let a = labels[i] as usize;
        let (x, y) = (i % w, i / w);
        let nb = [
            labels[if x > 0 { i - 1 } else { i }] as usize,
            labels[if x + 1 < w { i + 1 } else { i }] as usize,
            labels[if y > 0 { i - w } else { i }] as usize,
            labels[if y + 1 < h { i + w } else { i }] as usize,
        ];
        if nb == [a; 4] {
            return None;
        }
        let pi = i * 4;
        let cv = [rgba[pi] as i32, rgba[pi + 1] as i32, rgba[pi + 2] as i32];
        let dist = |m: &[i32; 3]| (cv[0] - m[0]).abs() + (cv[1] - m[1]).abs() + (cv[2] - m[2]).abs();
        let da = dist(&mean[a]);
        let mixture = |p: usize, q: usize| -> bool {
            let dpq: i32 = (0..3).map(|ch| (mean[p][ch] - mean[q][ch]).abs()).sum();
            dist(&mean[p]) + dist(&mean[q]) <= dpq + SNAP_SLACK
        };
        let mut best = (da, a);
        for b in nb {
            if b == a {
                continue;
            }
            let db = dist(&mean[b]);
            if db >= best.0 {
                continue;
            }
            if mixture(a, b) || nb.iter().any(|&c| c != a && c != b && mixture(c, b)) {
                best = (db, b);
            }
        }
        (best.1 != a).then_some(best.1 as u32)
    };

    let mut mean = vec![[0i32; 3]; k];
    let mut flips: Vec<(u32, u32)> = Vec::new();
    let mut front: Vec<u32> = Vec::new();

    for sweep in 0..SNAP_SWEEPS {
        for r in 0..k {
            if area[r] > 0 {
                for ch in 0..3 {
                    mean[r][ch] = (sum[r][ch] / area[r]) as i32;
                }
            }
        }
        flips.clear();
        if sweep == 0 {
            for y in 1..h.saturating_sub(1) {
                for i in y * w + 1..y * w + w.saturating_sub(1) {
                    let a = labels[i];
                    if labels[i - 1] == a
                        && labels[i + 1] == a
                        && labels[i - w] == a
                        && labels[i + w] == a
                    {
                        continue;
                    }
                    if let Some(b) = snap_target(i, labels, &mean) {
                        flips.push((i as u32, b));
                    }
                }
            }
        } else {
            for &i in &front {
                if let Some(b) = snap_target(i as usize, labels, &mean) {
                    flips.push((i, b));
                }
            }
        }
        if flips.is_empty() {
            break;
        }
        for &(i, b) in &flips {
            let (i, b) = (i as usize, b as usize);
            let a = labels[i] as usize;
            if area[a] <= 1 {
                continue;
            }
            let pi = i * 4;
            labels[i] = b as u32;
            area[a] -= 1;
            area[b] += 1;
            for ch in 0..3 {
                let v = rgba[pi + ch] as u64;
                sum[a][ch] -= v;
                sum[b][ch] += v;
            }
        }
        front.clear();
        for &(i, _) in &flips {
            let i = i as usize;
            let (x, y) = (i % w, i / w);
            front.push(i as u32);
            if x > 0 { front.push((i - 1) as u32); }
            if x + 1 < w { front.push((i + 1) as u32); }
            if y > 0 { front.push((i - w) as u32); }
            if y + 1 < h { front.push((i + w) as u32); }
        }
        front.sort_unstable();
        front.dedup();
    }
    let _ = n;
}

fn absorb_small_contrast_aware(
    min_area: usize,
    pairs: &[(u32, u32)],
    uf: &mut Uf,
    area: &mut [u64],
    sum: &mut [[u64; 3]],
) {
    let k = area.len();
    let mean_diff = |sa: &[u64; 3], aa: u64, sb: &[u64; 3], ab: u64| -> u64 {
        let mut d = 0i64;
        for ch in 0..3 {
            d += ((sa[ch] / aa.max(1)) as i64 - (sb[ch] / ab.max(1)) as i64).abs();
        }
        d as u64
    };
    loop {
        let mut best: Vec<(u64, u32)> = vec![(u64::MAX, u32::MAX); k];
        let mut any_small = false;
        for &(p, q) in pairs {
            let (a, b) = (uf.find(p), uf.find(q));
            if a == b {
                continue;
            }
            for (s, t) in [(a, b), (b, a)] {
                let (su, tu) = (s as usize, t as usize);
                if area[su] < min_area as u64 {
                    let d = mean_diff(&sum[su], area[su], &sum[tu], area[tu]);
                    // Protect crisp 1-2px high-contrast catchlights/eyelashes!
                    if area[su] >= 2 && d > 90 {
                        continue;
                    }
                    any_small = true;
                    if d < best[su].0 || (d == best[su].0 && t < best[su].1) {
                        best[su] = (d, t);
                    }
                }
            }
        }
        if !any_small {
            break;
        }
        let mut merged = false;
        for r in 0..k {
            let (_, tgt) = best[r];
            if tgt == u32::MAX {
                continue;
            }
            let rr = uf.find(r as u32);
            if rr as usize != r {
                continue;
            }
            let rt = uf.find(tgt);
            if rt == rr {
                continue;
            }
            uf.link(rt, rr);
            area[rt as usize] += area[r];
            for ch in 0..3 {
                sum[rt as usize][ch] += sum[r][ch];
            }
            merged = true;
        }
        if !merged {
            break;
        }
    }
}

// ---------------------------------------------------------------------------
// 3. Exact Topological Boundary Graph & Gapless Face Assembly
// ---------------------------------------------------------------------------

const N: u8 = 0;
const E: u8 = 1;
const S: u8 = 2;
const W: u8 = 3;
const DVEC: [(i32, i32); 4] = [(0, -1), (1, 0), (0, 1), (-1, 0)];

#[inline]
fn turn_right(d: u8) -> u8 { (d + 1) % 4 }
#[inline]
fn straight(d: u8) -> u8 { d }
#[inline]
fn turn_left(d: u8) -> u8 { (d + 3) % 4 }
#[inline]
fn reverse(d: u8) -> u8 { (d + 2) % 4 }

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
struct SegRef {
    seg: u32,
    forward: bool,
}

#[derive(Clone, Debug)]
struct Node {
    corner: PointI32,
    out: [Option<SegRef>; 4],
}

#[derive(Clone, Debug)]
struct Segment {
    points: Vec<PointI32>,
    start: Option<u32>,
    end: Option<u32>,
    left: u32,
    right: u32,
    first_dir: u8,
    last_dir: u8,
}

impl Segment {
    #[inline]
    fn is_ring(&self) -> bool {
        self.start.is_none()
    }
}

struct MosaicGraph {
    nodes: Vec<Node>,
    segments: Vec<Segment>,
}

#[inline]
fn label_at(part: &WatershedPartition, x: i32, y: i32) -> u32 {
    if x < 0 || y < 0 || (x as usize) >= part.width || (y as usize) >= part.height {
        OUTSIDE
    } else {
        part.labels[y as usize * part.width + x as usize]
    }
}

fn edge_present(part: &WatershedPartition, x: i32, y: i32, d: u8) -> bool {
    let nw = label_at(part, x - 1, y - 1);
    let ne = label_at(part, x, y - 1);
    let sw = label_at(part, x - 1, y);
    let se = label_at(part, x, y);
    match d {
        N => nw != ne,
        E => ne != se,
        S => sw != se,
        W => nw != sw,
        _ => false,
    }
}

fn left_pixel_at(part: &WatershedPartition, x: i32, y: i32, d: u8) -> u32 {
    match d {
        N => label_at(part, x - 1, y - 1),
        E => label_at(part, x, y - 1),
        S => label_at(part, x, y),
        W => label_at(part, x - 1, y),
        _ => OUTSIDE,
    }
}

fn extract_boundary_graph(part: &WatershedPartition) -> MosaicGraph {
    let w = part.width as i32;
    let h = part.height as i32;
    let cw = part.width + 1;
    let ch = part.height + 1;

    let mut node_at = vec![u32::MAX; cw * ch];
    let mut visited_v = vec![false; cw * part.height];
    let mut visited_h = vec![false; part.width * ch];
    let mut nodes: Vec<Node> = Vec::new();
    let mut segments: Vec<Segment> = Vec::new();

    let edge_mask = |x: i32, y: i32| -> u8 {
        let nw = label_at(part, x - 1, y - 1);
        let ne = label_at(part, x, y - 1);
        let sw = label_at(part, x - 1, y);
        let se = label_at(part, x, y);
        let mut m = 0u8;
        if nw != ne { m |= 1 << N; }
        if ne != se { m |= 1 << E; }
        if sw != se { m |= 1 << S; }
        if nw != sw { m |= 1 << W; }
        m
    };

    let side_pixels = |x: i32, y: i32, d: u8| -> (u32, u32) {
        let nw = label_at(part, x - 1, y - 1);
        let ne = label_at(part, x, y - 1);
        let sw = label_at(part, x - 1, y);
        let se = label_at(part, x, y);
        match d {
            N => (nw, ne),
            E => (ne, se),
            S => (se, sw),
            W => (sw, nw),
            _ => unreachable!(),
        }
    };

    // Pass A: degree >= 3 junction corners
    for y in 0..=h {
        for x in 0..=w {
            if edge_mask(x, y).count_ones() >= 3 {
                let id = nodes.len() as u32;
                nodes.push(Node { corner: PointI32 { x, y }, out: [None; 4] });
                node_at[y as usize * cw + x as usize] = id;
            }
        }
    }

    let is_visited = |vv: &[bool], vh: &[bool], x: i32, y: i32, d: u8| -> bool {
        match d {
            N => vv[(y - 1) as usize * cw + x as usize],
            S => vv[y as usize * cw + x as usize],
            E => vh[y as usize * part.width + x as usize],
            W => vh[y as usize * part.width + (x - 1) as usize],
            _ => unreachable!(),
        }
    };

    let mark_visited = |vv: &mut [bool], vh: &mut [bool], x: i32, y: i32, d: u8| {
        match d {
            N => vv[(y - 1) as usize * cw + x as usize] = true,
            S => vv[y as usize * cw + x as usize] = true,
            E => vh[y as usize * part.width + x as usize] = true,
            W => vh[y as usize * part.width + (x - 1) as usize] = true,
            _ => unreachable!(),
        }
    };

    let walk = |vv: &mut [bool], vh: &mut [bool], x0: i32, y0: i32, d0: u8| -> (Vec<PointI32>, u8, i32, i32) {
        let mut points = vec![PointI32 { x: x0, y: y0 }];
        let (mut cx, mut cy, mut d) = (x0, y0, d0);
        loop {
            mark_visited(vv, vh, cx, cy, d);
            let (dx, dy) = DVEC[d as usize];
            let (nx, ny) = (cx + dx, cy + dy);
            points.push(PointI32 { x: nx, y: ny });

            let mask = edge_mask(nx, ny);
            if mask.count_ones() >= 3 || (nx == x0 && ny == y0) {
                return (points, d, nx, ny);
            }
            let rev = reverse(d);
            for cand in 0..4u8 {
                if cand != rev && (mask & (1 << cand)) != 0 {
                    d = cand;
                    break;
                }
            }
            cx = nx;
            cy = ny;
        }
    };

    // Pass B: Node-to-node open chains
    for nid in 0..nodes.len() {
        let corner = nodes[nid].corner;
        let (x, y) = (corner.x, corner.y);
        let mask = edge_mask(x, y);
        for d in 0..4u8 {
            if (mask & (1 << d)) == 0 || is_visited(&visited_v, &visited_h, x, y, d) {
                continue;
            }
            let (left, right) = side_pixels(x, y, d);
            let (points, last_dir, ex, ey) = walk(&mut visited_v, &mut visited_h, x, y, d);
            let end_nid = node_at[ey as usize * cw + ex as usize];
            let seg_id = segments.len() as u32;
            segments.push(Segment {
                points,
                start: Some(nid as u32),
                end: Some(end_nid),
                left,
                right,
                first_dir: d,
                last_dir,
            });
            nodes[nid].out[d as usize] = Some(SegRef { seg: seg_id, forward: true });
            nodes[end_nid as usize].out[reverse(last_dir) as usize] =
                Some(SegRef { seg: seg_id, forward: false });
        }
    }

    // Pass C: Closed loops
    for y in 0..=h {
        for x in 0..=w {
            let mask = edge_mask(x, y);
            for d in 0..4u8 {
                if (mask & (1 << d)) == 0 || is_visited(&visited_v, &visited_h, x, y, d) {
                    continue;
                }
                let (left, right) = side_pixels(x, y, d);
                let (points, _, _, _) = walk(&mut visited_v, &mut visited_h, x, y, d);
                segments.push(Segment {
                    points,
                    start: None,
                    end: None,
                    left,
                    right,
                    first_dir: d,
                    last_dir: 0,
                });
            }
        }
    }

    MosaicGraph { nodes, segments }
}

fn assemble_faces(graph: &MosaicGraph, part: &WatershedPartition) -> BTreeMap<u32, Vec<Vec<SegRef>>> {
    let mut contours_by_region: BTreeMap<u32, Vec<Vec<SegRef>>> = BTreeMap::new();
    let mut used = vec![[false; 2]; graph.segments.len()];

    let successor = |x: i32, y: i32, d_in: u8, r: u32| -> u8 {
        for &d in &[turn_right(d_in), straight(d_in), turn_left(d_in)] {
            if edge_present(part, x, y, d) && left_pixel_at(part, x, y, d) == r {
                return d;
            }
        }
        // Defensive fallback (topology preserves strict planar connectivity)
        d_in
    };

    for seg_id in 0..graph.segments.len() {
        if graph.segments[seg_id].is_ring() {
            continue;
        }
        for forward in [true, false] {
            let sref = SegRef { seg: seg_id as u32, forward };
            let seg = &graph.segments[seg_id];
            let region = if forward { seg.left } else { seg.right };
            if region == OUTSIDE || used[seg_id][forward as usize] {
                continue;
            }
            let mut contour = Vec::new();
            let mut cur = sref;
            loop {
                used[cur.seg as usize][cur.forward as usize] = true;
                contour.push(cur);
                let cseg = &graph.segments[cur.seg as usize];
                let (nid, d_in) = if cur.forward {
                    (cseg.end.unwrap(), cseg.last_dir)
                } else {
                    (cseg.start.unwrap(), reverse(cseg.first_dir))
                };
                let corner = graph.nodes[nid as usize].corner;
                let d_next = successor(corner.x, corner.y, d_in, region);
                if let Some(next_ref) = graph.nodes[nid as usize].out[d_next as usize] {
                    cur = next_ref;
                } else {
                    break;
                }
                if cur == sref {
                    break;
                }
            }
            if (region as usize) < part.region_count {
                contours_by_region.entry(region).or_default().push(contour);
            }
        }
    }

    for seg_id in 0..graph.segments.len() {
        let seg = &graph.segments[seg_id];
        if !seg.is_ring() {
            continue;
        }
        for (region, forward) in [(seg.left, true), (seg.right, false)] {
            if region == OUTSIDE || (region as usize) >= part.region_count {
                continue;
            }
            contours_by_region
                .entry(region)
                .or_default()
                .push(vec![SegRef { seg: seg_id as u32, forward }]);
        }
    }

    contours_by_region
}

// ---------------------------------------------------------------------------
// 4. Rayon-Parallel High-Precision Segment Fitter (Tight Error Bound = 2.0)
// ---------------------------------------------------------------------------

#[derive(Clone, Debug)]
enum FittedGeom {
    Polyline(Vec<PointF64>),
    Beziers(Vec<[PointF64; 4]>),
}

#[inline]
fn pt_f64(p: PointI32) -> PointF64 {
    PointF64 { x: p.x as f64, y: p.y as f64 }
}

fn straight_cubic(a: PointF64, b: PointF64) -> [PointF64; 4] {
    [
        a,
        PointF64 { x: a.x + (b.x - a.x) / 3.0, y: a.y + (b.y - a.y) / 3.0 },
        PointF64 { x: a.x + 2.0 * (b.x - a.x) / 3.0, y: a.y + 2.0 * (b.y - a.y) / 3.0 },
        b,
    ]
}

fn fit_segment_spline(
    seg: &Segment,
    corner_rad: f64,
    length_threshold: f64,
    splice_rad: f64,
    fit_error: f64,
) -> FittedGeom {
    let closed = seg.is_ring();
    let raw_pts: Vec<PointF64> = if closed {
        let end = seg.points.len().saturating_sub(1);
        seg.points[..end].iter().copied().map(pt_f64).collect()
    } else {
        seg.points.iter().copied().map(pt_f64).collect()
    };

    if raw_pts.len() <= 2 || (closed && raw_pts.len() <= 3) {
        return FittedGeom::Polyline(seg.points.iter().copied().map(pt_f64).collect());
    }

    // Detect macro corners ONLY with symmetric 3px chords on paths long enough to contain true
    // geometric corners (n >= 7). Short junction-to-junction edges (n <= 6) must relax cleanly so
    // 1px pixel stairs become smooth curves/diagonals rather than boxy staircase steps.
    let n = raw_pts.len();
    let span = 3usize;
    let mut locked = vec![false; n];
    if !closed {
        locked[0] = true;
        locked[n - 1] = true;
    }

    if n >= 7 {
        for i in 0..n {
            if !closed && (i < span || i + span >= n) {
                continue;
            }
            let prev_idx = if closed { (i + n - span) % n } else { i - span };
            let next_idx = if closed { (i + span) % n } else { i + span };
            let ax = raw_pts[i].x - raw_pts[prev_idx].x;
            let ay = raw_pts[i].y - raw_pts[prev_idx].y;
            let bx = raw_pts[next_idx].x - raw_pts[i].x;
            let by = raw_pts[next_idx].y - raw_pts[i].y;
            let la = (ax * ax + ay * ay).sqrt();
            let lb = (bx * bx + by * by).sqrt();
            if la > 1e-6 && lb > 1e-6 {
                let cos_t = ((ax * bx + ay * by) / (la * lb)).clamp(-1.0, 1.0);
                let turn = cos_t.acos();
                if turn >= corner_rad {
                    locked[i] = true;
                }
            }
        }
    }

    // 3 passes of corner-locked [0.25, 0.50, 0.25] sub-pixel smoothing eliminate 1px pixel
    // staircase stepping while keeping all junctions and sharp architectural corners anchored.
    let mut pts = raw_pts;
    let passes = if length_threshold >= 1.5 { 4 } else { 3 };
    let mut next_pts = pts.clone();
    for _ in 0..passes {
        for i in 0..n {
            if locked[i] {
                next_pts[i] = pts[i];
                continue;
            }
            let p_prev = if closed { pts[(i + n - 1) % n] } else { pts[i - 1] };
            let p_next = if closed { pts[(i + 1) % n] } else { pts[i + 1] };
            next_pts[i] = PointF64 {
                x: 0.25 * p_prev.x + 0.50 * pts[i].x + 0.25 * p_next.x,
                y: 0.25 * p_prev.y + 0.50 * pts[i].y + 0.25 * p_next.y,
            };
        }
        std::mem::swap(&mut pts, &mut next_pts);
    }

    if closed {
        // Closed ring: simplify smoothed loop cleanly before fitting closed Bezier splines
        let rdp_eps = (fit_error * 0.24).clamp(0.18, 0.85);
        let reduced = rdp_simplify_polyline(&pts, rdp_eps);
        if reduced.len() <= 2 {
            let mut out = reduced;
            out.push(out[0]);
            return FittedGeom::Polyline(out);
        }
        let ring_path = PathF64::from_points({
            let mut closed_pts = reduced.clone();
            closed_pts.push(reduced[0]);
            closed_pts
        });
        let splice = SubdivideSmooth::find_splice_points(&ring_path, splice_rad, true);
        let ring = &reduced;
        let len = ring.len();
        let mut cuts: Vec<usize> = splice
            .iter()
            .enumerate()
            .filter_map(|(i, &s)| if s { Some(i) } else { None })
            .collect();
        if cuts.is_empty() { cuts.push(0); }
        if cuts.len() == 1 { cuts.push((cuts[0] + len / 2) % len); }

        let mut beziers = Vec::new();
        for i in 0..cuts.len() {
            let j = (i + 1) % cuts.len();
            let (from, to) = (cuts[i], cuts[j]);
            let mut sub = Vec::new();
            if from < to {
                sub.extend_from_slice(&ring[from..=to]);
            } else if from > to {
                sub.extend_from_slice(&ring[from..len]);
                sub.extend_from_slice(&ring[0..=to]);
            }
            if sub.len() >= 2 {
                if sub.len() == 2 {
                    beziers.push(straight_cubic(sub[0], sub[1]));
                } else {
                    beziers.extend(SubdivideSmooth::fit_points_with_beziers(&sub, fit_error));
                }
            }
        }
        if beziers.is_empty() {
            let mut out = reduced;
            out.push(out[0]);
            FittedGeom::Polyline(out)
        } else {
            FittedGeom::Beziers(beziers)
        }
    } else {
        // Open graph segment between pinned junctions: preserve locked macro corners & sub-slices
        let mut anchors: Vec<usize> = Vec::with_capacity(8);
        for (idx, &is_corner) in locked.iter().enumerate() {
            if is_corner {
                anchors.push(idx);
            }
        }
        if anchors.first() != Some(&0) {
            anchors.insert(0, 0);
        }
        if anchors.last() != Some(&(n - 1)) {
            anchors.push(n - 1);
        }

        let rdp_eps = (fit_error * 0.24).clamp(0.18, 0.85);
        let mut beziers = Vec::new();
        for span_win in anchors.windows(2) {
            let a = span_win[0];
            let b = span_win[1];
            if b <= a {
                continue;
            }
            let slice_reduced = rdp_simplify_polyline(&pts[a..=b], rdp_eps);
            if slice_reduced.len() <= 2 {
                beziers.push(straight_cubic(slice_reduced[0], slice_reduced[slice_reduced.len() - 1]));
                continue;
            }
            let sub_path = PathF64::from_points(slice_reduced.clone());
            let splice = SubdivideSmooth::find_splice_points(&sub_path, splice_rad, false);
            let cuts: Vec<usize> = splice
                .iter()
                .enumerate()
                .filter_map(|(i, &s)| if s { Some(i) } else { None })
                .collect();
            if cuts.len() < 2 {
                beziers.extend(SubdivideSmooth::fit_points_with_beziers(&slice_reduced, fit_error));
            } else {
                for w in cuts.windows(2) {
                    let sub = &slice_reduced[w[0]..=w[1]];
                    match sub.len() {
                        0 | 1 => {}
                        2 => beziers.push(straight_cubic(sub[0], sub[1])),
                        _ => beziers.extend(SubdivideSmooth::fit_points_with_beziers(sub, fit_error)),
                    }
                }
            }
        }

        if beziers.is_empty() {
            return FittedGeom::Polyline(pts);
        }
        beziers.first_mut().unwrap()[0] = pt_f64(seg.points[0]);
        beziers.last_mut().unwrap()[3] = pt_f64(seg.points[seg.points.len() - 1]);
        FittedGeom::Beziers(beziers)
    }
}

fn fit_segment_polygon(seg: &Segment, simplify_eps: f64) -> FittedGeom {
    let simplified = PathSimplify::limit_penalties(&PathI32::from_points(seg.points.clone()));
    let pts: Vec<PointF64> = simplified.path.iter().copied().map(pt_f64).collect();
    if simplify_eps > 0.05 && pts.len() > 2 {
        FittedGeom::Polyline(rdp_simplify_polyline(&pts, simplify_eps))
    } else {
        FittedGeom::Polyline(pts)
    }
}

/// Douglas-Peucker polyline simplification that preserves exact start/end vertices so
/// shared topological boundary junctions stay strictly watertight across adjacent faces.
fn rdp_simplify_polyline(pts: &[PointF64], eps: f64) -> Vec<PointF64> {
    if pts.len() <= 2 {
        return pts.to_vec();
    }
    let eps2 = eps * eps;
    let mut keep = vec![false; pts.len()];
    keep[0] = true;
    keep[pts.len() - 1] = true;

    let mut stack = vec![(0usize, pts.len() - 1)];
    while let Some((start, end)) = stack.pop() {
        if end <= start + 1 {
            continue;
        }
        let a = pts[start];
        let b = pts[end];
        let abx = b.x - a.x;
        let aby = b.y - a.y;
        let ab_len2 = abx * abx + aby * aby;

        let mut max_d2 = 0.0;
        let mut max_idx = start;
        for (i, p) in pts.iter().enumerate().take(end).skip(start + 1) {
            let d2 = if ab_len2 <= 1e-12 {
                let dx = p.x - a.x;
                let dy = p.y - a.y;
                dx * dx + dy * dy
            } else {
                let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / ab_len2;
                let px = a.x + t * abx;
                let py = a.y + t * aby;
                let dx = p.x - px;
                let dy = p.y - py;
                dx * dx + dy * dy
            };
            if d2 > max_d2 {
                max_d2 = d2;
                max_idx = i;
            }
        }
        if max_d2 > eps2 && max_idx != start && max_idx != end {
            keep[max_idx] = true;
            stack.push((start, max_idx));
            stack.push((max_idx, end));
        }
    }

    pts.iter()
        .enumerate()
        .filter_map(|(i, &p)| if keep[i] { Some(p) } else { None })
        .collect()
}

// ---------------------------------------------------------------------------
// 5. Clamped 2D Linear Color Gradient Solver & Direct W3C SVG Emission
// ---------------------------------------------------------------------------

#[derive(Clone, Default)]
struct RegColorStats {
    count: f64,
    sx: f64,
    sy: f64,
    sxx: f64,
    sxy: f64,
    syy: f64,
    sr: f64,
    sg: f64,
    sb: f64,
    sxr: f64,
    syr: f64,
    sxg: f64,
    syg: f64,
    sxb: f64,
    syb: f64,
    min_rgb: [u8; 3],
    max_rgb: [u8; 3],
}

#[derive(Clone)]
enum RegionPaint {
    Solid(String),
    Linear {
        x1: f64,
        y1: f64,
        x2: f64,
        y2: f64,
        c1: String,
        cm: String,
        c2: String,
    },
}

fn solve_clamped_gradients(
    rgba: &[u8],
    part: &WatershedPartition,
    use_gradients: bool,
) -> Vec<RegionPaint> {
    let n_reg = part.region_count;
    if !use_gradients {
        return part.paints.iter().map(|c| RegionPaint::Solid(c.to_hex_string())).collect();
    }

    let w = part.width;
    let h = part.height;
    let mut stats = vec![
        RegColorStats {
            min_rgb: [255, 255, 255],
            max_rgb: [0, 0, 0],
            ..RegColorStats::default()
        };
        n_reg
    ];

    for y in 0..h {
        let fy = y as f64 + 0.5;
        for x in 0..w {
            let fx = x as f64 + 0.5;
            let lid = part.labels[y * w + x];
            if lid == OUTSIDE || (lid as usize) >= n_reg {
                continue;
            }
            let st = &mut stats[lid as usize];
            let pi = (y * w + x) * 4;
            let r = rgba[pi];
            let g = rgba[pi + 1];
            let b = rgba[pi + 2];
            st.count += 1.0;
            st.sx += fx;
            st.sy += fy;
            st.sxx += fx * fx;
            st.sxy += fx * fy;
            st.syy += fy * fy;
            st.sr += r as f64;
            st.sg += g as f64;
            st.sb += b as f64;
            st.sxr += fx * r as f64;
            st.syr += fy * r as f64;
            st.sxg += fx * g as f64;
            st.syg += fy * g as f64;
            st.sxb += fx * b as f64;
            st.syb += fy * b as f64;
            st.min_rgb[0] = st.min_rgb[0].min(r);
            st.min_rgb[1] = st.min_rgb[1].min(g);
            st.min_rgb[2] = st.min_rgb[2].min(b);
            st.max_rgb[0] = st.max_rgb[0].max(r);
            st.max_rgb[1] = st.max_rgb[1].max(g);
            st.max_rgb[2] = st.max_rgb[2].max(b);
        }
    }

    #[derive(Clone, Copy)]
    struct GradPlane {
        mx: f64,
        my: f64,
        ux: f64,
        uy: f64,
        mr: f64,
        mg: f64,
        mb: f64,
        gr: (f64, f64),
        gg: (f64, f64),
        gb: (f64, f64),
        is_grad: bool,
        tmin: f64,
        tmax: f64,
    }

    let mut planes: Vec<GradPlane> = (0..n_reg)
        .into_par_iter()
        .map(|i| {
            let st = &stats[i];
            let base = part.paints[i];
            if st.count < 8.0 {
                return GradPlane {
                    mx: 0.0, my: 0.0, ux: 1.0, uy: 0.0,
                    mr: base.r as f64, mg: base.g as f64, mb: base.b as f64,
                    gr: (0.0, 0.0), gg: (0.0, 0.0), gb: (0.0, 0.0),
                    is_grad: false, tmin: f64::MAX, tmax: f64::MIN,
                };
            }
            let n = st.count;
            let mx = st.sx / n;
            let my = st.sy / n;
            let mr = st.sr / n;
            let mg = st.sg / n;
            let mb = st.sb / n;
            // Light ridge regularization prevents degenerate slivers from blowing up slope
            let cxx = st.sxx - n * mx * mx + 0.5;
            let cxy = st.sxy - n * mx * my;
            let cyy = st.syy - n * my * my + 0.5;
            let det = cxx * cyy - cxy * cxy;
            if det.abs() < 1e-2 {
                return GradPlane {
                    mx, my, ux: 1.0, uy: 0.0, mr, mg, mb,
                    gr: (0.0, 0.0), gg: (0.0, 0.0), gb: (0.0, 0.0),
                    is_grad: false, tmin: f64::MAX, tmax: f64::MIN,
                };
            }
            let solve = |sxv: f64, syv: f64, mv: f64| -> (f64, f64) {
                let rx = sxv - n * mx * mv;
                let ry = syv - n * my * mv;
                ((cyy * rx - cxy * ry) / det, (-cxy * rx + cxx * ry) / det)
            };
            let gr = solve(st.sxr, st.syr, mr);
            let gg = solve(st.sxg, st.syg, mg);
            let gb = solve(st.sxb, st.syb, mb);

            let gx_l = 0.299 * gr.0 + 0.587 * gg.0 + 0.114 * gb.0;
            let gy_l = 0.299 * gr.1 + 0.587 * gg.1 + 0.114 * gb.1;
            let lmag = (gx_l * gx_l + gy_l * gy_l).sqrt();
            let (gx, gy, gmag) = if lmag > 0.05 {
                (gx_l, gy_l, lmag)
            } else {
                let m0 = (gr.0 * gr.0 + gr.1 * gr.1).sqrt();
                let m1 = (gg.0 * gg.0 + gg.1 * gg.1).sqrt();
                let m2 = (gb.0 * gb.0 + gb.1 * gb.1).sqrt();
                if m0 >= m1 && m0 >= m2 { (gr.0, gr.1, m0) }
                else if m1 >= m2 { (gg.0, gg.1, m1) }
                else { (gb.0, gb.1, m2) }
            };
            if gmag < 1e-4 {
                GradPlane {
                    mx, my, ux: 1.0, uy: 0.0, mr, mg, mb,
                    gr, gg, gb, is_grad: false, tmin: f64::MAX, tmax: f64::MIN,
                }
            } else {
                GradPlane {
                    mx, my, ux: gx / gmag, uy: gy / gmag, mr, mg, mb,
                    gr, gg, gb, is_grad: true, tmin: f64::MAX, tmax: f64::MIN,
                }
            }
        })
        .collect();

    for y in 0..h {
        let fy = y as f64 + 0.5;
        for x in 0..w {
            let fx = x as f64 + 0.5;
            let lid = part.labels[y * w + x];
            if lid != OUTSIDE && (lid as usize) < n_reg && planes[lid as usize].is_grad {
                let pl = &mut planes[lid as usize];
                let t = (fx - pl.mx) * pl.ux + (fy - pl.my) * pl.uy;
                if t < pl.tmin { pl.tmin = t; }
                if t > pl.tmax { pl.tmax = t; }
            }
        }
    }

    (0..n_reg)
        .into_par_iter()
        .map(|i| {
            let pl = &planes[i];
            let base = part.paints[i];
            if !pl.is_grad || (pl.tmax - pl.tmin) < 2.0 {
                return RegionPaint::Solid(base.to_hex_string());
            }
            let min_rgb = stats[i].min_rgb;
            let max_rgb = stats[i].max_rgb;
            let eval = |t: f64| -> (u8, u8, u8) {
                let dx = t * pl.ux;
                let dy = t * pl.uy;
                // Strictly clamp fitted gradient stops inside observed region channel bounds!
                // Eliminates any outlier/sliver color overshoot.
                let r = (pl.mr + pl.gr.0 * dx + pl.gr.1 * dy).round().clamp(min_rgb[0] as f64, max_rgb[0] as f64) as u8;
                let g = (pl.mg + pl.gg.0 * dx + pl.gg.1 * dy).round().clamp(min_rgb[1] as f64, max_rgb[1] as f64) as u8;
                let b = (pl.mb + pl.gb.0 * dx + pl.gb.1 * dy).round().clamp(min_rgb[2] as f64, max_rgb[2] as f64) as u8;
                (r, g, b)
            };
            let c1 = eval(pl.tmin);
            let cm = eval((pl.tmin + pl.tmax) * 0.5);
            let c2 = eval(pl.tmax);
            let delta = (c1.0 as i32 - c2.0 as i32).abs()
                + (c1.1 as i32 - c2.1 as i32).abs()
                + (c1.2 as i32 - c2.2 as i32).abs();
            let x1 = pl.mx + pl.tmin * pl.ux;
            let y1 = pl.my + pl.tmin * pl.uy;
            let x2 = pl.mx + pl.tmax * pl.ux;
            let y2 = pl.my + pl.tmax * pl.uy;
            let zero_vec = ((x2 - x1) * 10.0).round().abs() < 1.0
                && ((y2 - y1) * 10.0).round().abs() < 1.0;
            if delta < 7 || zero_vec {
                RegionPaint::Solid(base.to_hex_string())
            } else {
                RegionPaint::Linear {
                    x1,
                    y1,
                    x2,
                    y2,
                    c1: format!("#{:02X}{:02X}{:02X}", c1.0, c1.1, c1.2),
                    cm: format!("#{:02X}{:02X}{:02X}", cm.0, cm.1, cm.2),
                    c2: format!("#{:02X}{:02X}{:02X}", c2.0, c2.1, c2.2),
                }
            }
        })
        .collect()
}

#[inline]
fn fmt_num(out: &mut String, v: f64) -> f64 {
    use std::fmt::Write as _;
    let r = (v * 10.0).round() / 10.0;
    if (r - r.round()).abs() < 1e-6 {
        let _ = write!(out, "{}", r.round() as i64);
        r.round()
    } else {
        let _ = write!(out, "{:.1}", r);
        r
    }
}

#[inline]
fn fmt_pt(out: &mut String, x: f64, y: f64) -> PointF64 {
    let rx = fmt_num(out, x);
    out.push(',');
    let ry = fmt_num(out, y);
    PointF64 { x: rx, y: ry }
}

#[inline]
fn fmt_pt_rel(out: &mut String, dx: f64, dy: f64) -> (f64, f64) {
    let rdx = fmt_num(out, dx);
    if dy >= -0.05 && ((dy * 10.0).round() / 10.0) >= 0.0 {
        out.push(',');
    }
    let rdy = fmt_num(out, dy);
    (rdx, rdy)
}

pub fn vectorize_gradient_mosaic_svg(
    rgba: &[u8],
    width: usize,
    height: usize,
    sharpen_amount: f32,
    detail_level: f32, // 0.0 .. 1.0 (default 0.80)
    min_area: usize,
    polygon_only: bool,
    use_gradients: bool,
    corner_threshold_deg: i32,
    length_threshold: f64,
    fit_error: f64,
    simplify_tolerance: f64,
) -> String {
    let sharpened = if sharpen_amount > 0.0 {
        optical_sharpen(rgba, width, height, sharpen_amount)
    } else {
        rgba.to_vec()
    };

    // Scale target regions cleanly with sqrt(pixel count) so both 300px art and 1400px photos
    // get balanced crisp detail without exploding path counts!
    let n_px = (width * height) as f64;
    let d = detail_level.clamp(0.05, 1.0) as f64;
    let target_regions = ((n_px.sqrt() * (3.0 + 13.5 * d * d)).round() as usize).clamp(150, 9500);

    let part = segment_perceptual_watershed(&sharpened, width, height, target_regions, min_area);
    let fills = solve_clamped_gradients(&sharpened, &part, use_gradients);
    let graph = extract_boundary_graph(&part);
    let faces = assemble_faces(&graph, &part);

    let corner_rad = (corner_threshold_deg as f64) * std::f64::consts::PI / 180.0;
    let splice_rad = 32.0 * std::f64::consts::PI / 180.0;
    let simp = simplify_tolerance.max(0.0);
    let eff_fit_error = (fit_error + simp * 0.9).max(0.8);
    let eff_length_threshold = (length_threshold + simp * 0.25).clamp(0.6, 4.0);
    let poly_eps = if simp > 0.05 { simp * 0.85 } else { 0.45 };

    // Fit every shared boundary segment IN PARALLEL across all CPU cores!
    let fitted: Vec<FittedGeom> = graph
        .segments
        .par_iter()
        .map(|seg| {
            if polygon_only {
                fit_segment_polygon(seg, poly_eps)
            } else {
                fit_segment_spline(seg, corner_rad, eff_length_threshold, splice_rad, eff_fit_error)
            }
        })
        .collect();

    let mut svg = String::with_capacity(faces.len() * 140 + 4096);
    svg.push_str(&format!(
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!-- Generator: VectorForge Neural-Gradient Mosaic v4.0 -->\n<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" width=\"{}\" height=\"{}\" viewBox=\"0 0 {} {}\" fill-rule=\"nonzero\">\n",
        width, height, width, height
    ));

    // Seam-free mean color backdrop ensures any 0.25px anti-aliased edge interpolation
    // blends smoothly instead of exposing dark backdrop cracks!
    svg.push_str(&format!(
        "<rect width=\"{}\" height=\"{}\" fill=\"{}\"/>\n",
        width,
        height,
        part.mean_backdrop.to_hex_string()
    ));

    if use_gradients {
        svg.push_str("<defs>\n");
        for (idx, fill) in fills.iter().enumerate() {
            if let RegionPaint::Linear { x1, y1, x2, y2, c1, cm, c2 } = fill {
                svg.push_str(&format!(
                    "<linearGradient id=\"g{}\" gradientUnits=\"userSpaceOnUse\" x1=\"{:.1}\" y1=\"{:.1}\" x2=\"{:.1}\" y2=\"{:.1}\"><stop offset=\"0\" stop-color=\"{}\"/><stop offset=\"0.5\" stop-color=\"{}\"/><stop offset=\"1\" stop-color=\"{}\"/></linearGradient>\n",
                    idx, x1, y1, x2, y2, c1, cm, c2
                ));
            }
        }
        svg.push_str("</defs>\n");
    }

    use std::fmt::Write as _;
    for (&region_id, contours) in &faces {
        let mut d = String::with_capacity(192);
        let mut cur = PointF64 { x: 0.0, y: 0.0 };
        for contour in contours {
            let mut opened = false;
            for sref in contour {
                let geom = &fitted[sref.seg as usize];
                match geom {
                    FittedGeom::Polyline(pts) => {
                        if pts.len() < 2 {
                            continue;
                        }
                        if sref.forward {
                            if !opened {
                                d.push('M');
                                cur = fmt_pt(&mut d, pts[0].x, pts[0].y);
                                opened = true;
                            }
                            for p in &pts[1..] {
                                d.push('l');
                                let (rx, ry) = fmt_pt_rel(&mut d, p.x - cur.x, p.y - cur.y);
                                cur.x += rx;
                                cur.y += ry;
                            }
                        } else {
                            let n = pts.len();
                            if !opened {
                                d.push('M');
                                cur = fmt_pt(&mut d, pts[n - 1].x, pts[n - 1].y);
                                opened = true;
                            }
                            for p in pts[..n - 1].iter().rev() {
                                d.push('l');
                                let (rx, ry) = fmt_pt_rel(&mut d, p.x - cur.x, p.y - cur.y);
                                cur.x += rx;
                                cur.y += ry;
                            }
                        }
                    }
                    FittedGeom::Beziers(curves) => {
                        if curves.is_empty() {
                            continue;
                        }
                        if sref.forward {
                            if !opened {
                                d.push('M');
                                cur = fmt_pt(&mut d, curves[0][0].x, curves[0][0].y);
                                opened = true;
                            }
                            for c in curves {
                                d.push('c');
                                let (dx1, _) = fmt_pt_rel(&mut d, c[1].x - cur.x, c[1].y - cur.y);
                                let _ = dx1;
                                if ((c[2].x - cur.x) * 10.0).round() >= 0.0 { d.push(' '); }
                                let _ = fmt_pt_rel(&mut d, c[2].x - cur.x, c[2].y - cur.y);
                                if ((c[3].x - cur.x) * 10.0).round() >= 0.0 { d.push(' '); }
                                let (rx, ry) = fmt_pt_rel(&mut d, c[3].x - cur.x, c[3].y - cur.y);
                                cur.x += rx;
                                cur.y += ry;
                            }
                        } else {
                            let last = &curves[curves.len() - 1];
                            if !opened {
                                d.push('M');
                                cur = fmt_pt(&mut d, last[3].x, last[3].y);
                                opened = true;
                            }
                            for c in curves.iter().rev() {
                                d.push('c');
                                let _ = fmt_pt_rel(&mut d, c[2].x - cur.x, c[2].y - cur.y);
                                if ((c[1].x - cur.x) * 10.0).round() >= 0.0 { d.push(' '); }
                                let _ = fmt_pt_rel(&mut d, c[1].x - cur.x, c[1].y - cur.y);
                                if ((c[0].x - cur.x) * 10.0).round() >= 0.0 { d.push(' '); }
                                let (rx, ry) = fmt_pt_rel(&mut d, c[0].x - cur.x, c[0].y - cur.y);
                                cur.x += rx;
                                cur.y += ry;
                            }
                        }
                    }
                }
            }
            if opened {
                d.push('Z');
            }
        }
        if !d.is_empty() {
            match &fills[region_id as usize] {
                RegionPaint::Solid(hex) => {
                    let _ = writeln!(
                        svg,
                        "<path d=\"{}\" fill=\"{}\" stroke=\"{}\" stroke-width=\"0.25\" stroke-linejoin=\"round\"/>",
                        d, hex, hex
                    );
                }
                RegionPaint::Linear { cm, .. } => {
                    // Use solid midpoint 0.25px seam stroke so Skia eliminates hairline cracks
                    // without doubling per-path linearGradient shader overhead.
                    let _ = writeln!(
                        svg,
                        "<path d=\"{}\" fill=\"url(#g{})\" stroke=\"{}\" stroke-width=\"0.25\" stroke-linejoin=\"round\"/>",
                        d, region_id, cm
                    );
                }
            }
        }
    }

    svg.push_str("</svg>\n");
    svg
}
