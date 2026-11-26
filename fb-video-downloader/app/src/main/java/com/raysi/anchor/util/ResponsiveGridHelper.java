package com.raysi.anchor.util;

import android.view.View;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

/**
 * Dynamically adapts RecyclerView column spans to container width in dp
 * across 5-inch compact phones, foldables, split-screen windows, and 14.2-inch tablets.
 */
public final class ResponsiveGridHelper {

    private ResponsiveGridHelper() {
    }

    public static void attachAdaptiveGrid(
            @NonNull RecyclerView recyclerView,
            int targetColumnWidthDp,
            int minColumns,
            int maxColumns
    ) {
        float density = recyclerView.getResources().getDisplayMetrics().density;
        int initialSpan = computeSpanCount(
                recyclerView.getResources().getConfiguration().screenWidthDp,
                targetColumnWidthDp,
                minColumns,
                maxColumns
        );
        GridLayoutManager layoutManager = new GridLayoutManager(recyclerView.getContext(), initialSpan);
        recyclerView.setLayoutManager(layoutManager);

        recyclerView.addOnLayoutChangeListener(new View.OnLayoutChangeListener() {
            private int lastWidthPx = -1;

            @Override
            public void onLayoutChange(
                    View v,
                    int left,
                    int top,
                    int right,
                    int bottom,
                    int oldLeft,
                    int oldTop,
                    int oldRight,
                    int oldBottom
            ) {
                int widthPx = (right - left) - v.getPaddingLeft() - v.getPaddingRight();
                if (widthPx <= 0 || widthPx == lastWidthPx) {
                    return;
                }
                lastWidthPx = widthPx;
                int widthDp = Math.round(widthPx / Math.max(1f, density));
                int newSpan = computeSpanCount(widthDp, targetColumnWidthDp, minColumns, maxColumns);
                if (layoutManager.getSpanCount() != newSpan) {
                    layoutManager.setSpanCount(newSpan);
                }
            }
        });
    }

    public static int computeSpanCount(int widthDp, int targetColumnWidthDp, int minColumns, int maxColumns) {
        if (widthDp <= 0 || targetColumnWidthDp <= 0) {
            return minColumns;
        }
        int computed = widthDp / targetColumnWidthDp;
        return Math.max(minColumns, Math.min(maxColumns, computed));
    }
}
