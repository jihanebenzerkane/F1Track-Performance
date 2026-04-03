package org.Formula1.utils;

import java.util.ArrayList;
import java.util.List;

public class TableRenderer {
    public static void render(String title, String[] headers, List<String[]> rows) {
        if (rows == null || rows.isEmpty()) {
            System.out.println("No data available for : " + title);
            return;
        }

        int[] colWidths = new int[headers.length];
        for (int i = 0; i < headers.length; i++) {
            colWidths[i] = headers[i].length();
        }

        for (String[] row : rows) {
            for (int i = 0; i < row.length && i < colWidths.length; i++) {
                if (row[i] != null) {
                    colWidths[i] = Math.max(colWidths[i], row[i].length());
                }
            }
        }

        // Draw top border
        printLine(colWidths, '╔', '╦', '╗');
        
        // Print Title
        int totalWidth = 0;
        for (int w : colWidths) totalWidth += w + 3;
        System.out.printf("║ %-" + (totalWidth - 3) + "s ║\n", title.toUpperCase());
        
        printLine(colWidths, '╠', '╬', '╣');

        // Print Headers
        System.out.print("║");
        for (int i = 0; i < headers.length; i++) {
            System.out.printf(" %-" + colWidths[i] + "s ║", headers[i]);
        }
        System.out.println();

        printLine(colWidths, '╠', '╬', '╣');

        // Print Rows
        for (String[] row : rows) {
            System.out.print("║");
            for (int i = 0; i < row.length; i++) {
                String val = (i < row.length && row[i] != null) ? row[i] : "";
                System.out.printf(" %-" + colWidths[i] + "s ║", val);
            }
            System.out.println();
        }

        // Draw bottom border
        printLine(colWidths, '╚', '╩', '╝');
    }

    private static void printLine(int[] widths, char left, char mid, char right) {
        System.out.print(left);
        for (int i = 0; i < widths.length; i++) {
            for (int j = 0; j < widths[i] + 2; j++) System.out.print('═');
            if (i < widths.length - 1) System.out.print(mid);
        }
        System.out.println(right);
    }
}
