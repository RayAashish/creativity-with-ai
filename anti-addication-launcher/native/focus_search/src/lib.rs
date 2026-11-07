// native/focus_search/src/lib.rs
use jni::objects::{JClass, JIntArray, JObjectArray, JString};
use jni::sys::{jint, jlong};
use jni::JNIEnv;
use std::cmp::min;
use std::sync::Mutex;

struct IndexedEntry {
    chars: Vec<char>,
    word_boundaries: Vec<usize>,
    original_index: i32,
}

pub struct SearchIndex {
    entries: Vec<IndexedEntry>,
}

impl SearchIndex {
    pub fn new() -> Self {
        SearchIndex {
            entries: Vec::new(),
        }
    }

    pub fn update(&mut self, labels: Vec<String>) {
        self.entries.clear();
        self.entries.reserve(labels.len());

        for (idx, label) in labels.into_iter().enumerate() {
            let lower = label.to_lowercase();
            let chars: Vec<char> = lower.chars().collect();
            let len = chars.len();

            let mut word_boundaries = Vec::with_capacity(4);
            for i in 1..len {
                let prev = chars[i - 1];
                if prev == ' ' || prev == '-' || prev == '_' || prev == '.' {
                    word_boundaries.push(i);
                }
            }

            self.entries.push(IndexedEntry {
                chars,
                word_boundaries,
                original_index: idx as i32,
            });
        }
    }

    pub fn search(&self, query: &str, max_results: usize) -> Vec<i32> {
        let trimmed = query.trim();
        if trimmed.is_empty() {
            let count = min(self.entries.len(), max_results);
            return (0..count as i32).collect();
        }

        let q_lower = trimmed.to_lowercase();
        let q_chars: Vec<char> = q_lower.chars().collect();
        let q_len = q_chars.len();

        let mut scored_indices: Vec<(i32, i32)> = Vec::with_capacity(min(self.entries.len(), max_results * 2));
        let mut matrix = [0usize; 64 * 64];

        for entry in &self.entries {
            let score = score_entry(entry, &q_chars, q_len, &mut matrix);
            if score > 0 {
                scored_indices.push((entry.original_index, score));
            }
        }

        // Sort descending by score
        scored_indices.sort_by(|a, b| b.1.cmp(&a.1).then_with(|| a.0.cmp(&b.0)));

        let result_count = min(scored_indices.len(), max_results);
        scored_indices.iter().take(result_count).map(|(idx, _)| *idx).collect()
    }
}

fn score_entry(
    entry: &IndexedEntry,
    q_chars: &[char],
    q_len: usize,
    matrix: &mut [usize; 64 * 64],
) -> i32 {
    let s_chars = &entry.chars;
    let s_len = s_chars.len();

    // 1. Exact match
    if s_len == q_len && s_chars == q_chars {
        return 10_000;
    }

    // 2. Prefix match
    if s_len >= q_len && s_chars.starts_with(q_chars) {
        return 5_000 - (s_len as i32 - q_len as i32);
    }

    // 3. Word boundary prefix match
    for &wb in &entry.word_boundaries {
        if wb + q_len <= s_len && s_chars[wb..].starts_with(q_chars) {
            return 3_500 - (wb as i32 * 5) - (s_len as i32 - q_len as i32);
        }
    }

    // 4. Subsequence match
    let mut s_idx = 0;
    let mut q_idx = 0;
    let mut first_match = -1i32;
    let mut last_match = -1i32;

    while s_idx < s_len && q_idx < q_len {
        if s_chars[s_idx] == q_chars[q_idx] {
            if first_match == -1 {
                first_match = s_idx as i32;
            }
            last_match = s_idx as i32;
            q_idx += 1;
        }
        s_idx += 1;
    }

    if q_idx == q_len {
        let spread = last_match - first_match;
        return 2_000 - (spread * 2) - (s_len as i32 - q_len as i32);
    }

    // 5. Damerau-Levenshtein edit distance <= 2
    let diff = if s_len > q_len { s_len - q_len } else { q_len - s_len };
    if diff <= 2 && q_len >= 2 && s_len <= 63 && q_len <= 63 {
        let dist = damerau_levenshtein(s_chars, q_chars, 2, matrix);
        if dist <= 2 {
            return (1_000 - dist as i32 * 300) - diff as i32;
        }
    }

    0
}

fn damerau_levenshtein(
    s1: &[char],
    s2: &[char],
    max_dist: usize,
    matrix: &mut [usize; 64 * 64],
) -> usize {
    let len1 = s1.len();
    let len2 = s2.len();
    let stride = 64;

    for i in 0..=len1 {
        matrix[i * stride] = i;
    }
    for j in 0..=len2 {
        matrix[j] = j;
    }

    for i in 1..=len1 {
        let ch1 = s1[i - 1];
        let mut min_row = matrix[i * stride];

        for j in 1..=len2 {
            let ch2 = s2[j - 1];
            let cost = if ch1 == ch2 { 0 } else { 1 };

            let mut d = min(
                min(matrix[(i - 1) * stride + j] + 1, matrix[i * stride + (j - 1)] + 1),
                matrix[(i - 1) * stride + (j - 1)] + cost,
            );

            // Transposition
            if i > 1 && j > 1 && ch1 == s2[j - 2] && s1[i - 2] == ch2 {
                let trans_cost = matrix[(i - 2) * stride + (j - 2)] + 1;
                if trans_cost < d {
                    d = trans_cost;
                }
            }

            matrix[i * stride + j] = d;
            if d < min_row {
                min_row = d;
            }
        }

        if min_row > max_dist {
            return max_dist + 1;
        }
    }

    matrix[len1 * stride + len2]
}

// -------------------------------- JNI EXPORTS --------------------------------

#[no_mangle]
pub extern "system" fn Java_com_raysi_launcher_data_search_RustSearchEngine_nativeCreate(
    _env: JNIEnv,
    _class: JClass,
) -> jlong {
    let engine = Box::new(Mutex::new(SearchIndex::new()));
    Box::into_raw(engine) as jlong
}

#[no_mangle]
pub extern "system" fn Java_com_raysi_launcher_data_search_RustSearchEngine_nativeUpdateIndex<'local>(
    mut env: JNIEnv<'local>,
    _class: JClass<'local>,
    ptr: jlong,
    labels: JObjectArray<'local>,
) {
    if ptr == 0 {
        return;
    }
    let engine = unsafe { &*(ptr as *const Mutex<SearchIndex>) };
    let len = match env.get_array_length(&labels) {
        Ok(l) => l as usize,
        Err(_) => return,
    };

    let mut rust_labels = Vec::with_capacity(len);
    for i in 0..len {
        if let Ok(elem) = env.get_object_array_element(&labels, i as jint) {
            let jstr: JString = elem.into();
            let label_str = match env.get_string(&jstr) {
                Ok(s) => s.to_string_lossy().into_owned(),
                Err(_) => String::new(),
            };
            rust_labels.push(label_str);
        }
    }

    if let Ok(mut lock) = engine.lock() {
        lock.update(rust_labels);
    }
}

#[no_mangle]
pub extern "system" fn Java_com_raysi_launcher_data_search_RustSearchEngine_nativeSearch<'local>(
    mut env: JNIEnv<'local>,
    _class: JClass<'local>,
    ptr: jlong,
    query: JString<'local>,
    max_results: jint,
) -> JIntArray<'local> {
    if ptr == 0 {
        return env.new_int_array(0).unwrap();
    }
    let engine = unsafe { &*(ptr as *const Mutex<SearchIndex>) };

    let query_str = match env.get_string(&query) {
        Ok(q) => q.to_string_lossy().into_owned(),
        Err(_) => String::new(),
    };

    let results = if let Ok(lock) = engine.lock() {
        lock.search(&query_str, max_results as usize)
    } else {
        Vec::new()
    };

    let out_array = env.new_int_array(results.len() as jint).unwrap();
    let _ = env.set_int_array_region(&out_array, 0, &results);
    out_array
}

#[no_mangle]
pub extern "system" fn Java_com_raysi_launcher_data_search_RustSearchEngine_nativeDestroy(
    _env: JNIEnv,
    _class: JClass,
    ptr: jlong,
) {
    if ptr != 0 {
        unsafe {
            let _ = Box::from_raw(ptr as *mut Mutex<SearchIndex>);
        }
    }
}
