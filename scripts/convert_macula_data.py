import duckdb
import argparse
import os
import sys

# --- Default Configuration ---
DEFAULT_TSV_FILE = "macula-greek-SBLGNT.tsv"
DEFAULT_DUCKDB_FILE = "macula.duckdb"
DEFAULT_TABLE_NAME = "macula"


def convert_tsv_to_duckdb(tsv_file_path, duckdb_file_path, table_name):
    """
    Converts a TSV file to a DuckDB database file.

    Args:
        tsv_file_path (str): Path to the input TSV file.
        duckdb_file_path (str): Path for the output DuckDB file.
        table_name (str): Name of the table to create in the DuckDB file.
    """
    print("Starting conversion:")
    print(f"  Input TSV: {os.path.abspath(tsv_file_path)}")
    print(f"  Output DuckDB: {os.path.abspath(duckdb_file_path)}")
    print(f"  Table Name: {table_name}")

    if not os.path.exists(tsv_file_path):
        print(f"Error: Input TSV file '{tsv_file_path}' not found.")
        sys.exit(1)

    # Connect to DuckDB. This will create the file if it doesn't exist,
    # or open it if it does. read_only=False allows writing.
    # Using `with` ensures the connection is closed.
    try:
        with duckdb.connect(database=duckdb_file_path, read_only=False) as con:
            print(f"Successfully connected to/created DuckDB file: {duckdb_file_path}")

            # Drop the table if it already exists to ensure a fresh import
            con.execute(f"DROP TABLE IF EXISTS {table_name};")
            print(f"Dropped table '{table_name}' if it existed.")

            # Create the table by selecting from the TSV file
            # We use the same parameters as your original script.
            # The f-string requires curly braces to be doubled {{ and }} for SQL string literals.
            # Or, use parameters for the file path.
            create_table_sql = f"""
            CREATE TABLE {table_name} AS
            SELECT *
            FROM read_csv(?, delim = '\t', header = true, types={{'strong': 'VARCHAR'}});
            """
            # Using parameter binding for file path is safer and cleaner
            con.execute(create_table_sql, [tsv_file_path])
            print(
                f"Created table '{table_name}' and loaded data from '{tsv_file_path}'."
            )

            # Rename the "xml:id" column to "macula_id"
            # Column names with special characters like ':' need to be double-quoted in SQL.
            con.execute(f"""
                ALTER TABLE {table_name}
                RENAME COLUMN "xml:id" TO macula_id;
            """)
            print(f"Renamed column 'xml:id' to 'macula_id' in table '{table_name}'.")

            # Rename class column to part_of_speech
            con.execute(f"""
                ALTER TABLE {table_name}
                RENAME COLUMN class TO part_of_speech;
            """)
            print(
                f"Renamed column 'class' to 'part_of_speech' in table '{table_name}'."
            )

            # Rename ln column to louw_nida
            con.execute(f"""
                ALTER TABLE {table_name}
                RENAME COLUMN ln TO louw_nida;
            """)
            print(f"Renamed column 'ln' to 'louw_nida' in table '{table_name}'.")

            # Rename english column to contextual_english_gloss
            con.execute(f"""
                ALTER TABLE {table_name}
                RENAME COLUMN english TO contextual_english_gloss;
            """)
            print(
                f"Renamed column 'english' to 'contextual_english_gloss' in table '{table_name}'."
            )

            # Rename mandarin column to contextual_mandarin_gloss
            con.execute(f"""
                ALTER TABLE {table_name}
                RENAME COLUMN mandarin TO contextual_mandarin_gloss;
            """)
            print(
                f"Renamed column 'mandarin' to 'contextual_mandarin_gloss' in table '{table_name}'."
            )

            # Optional: Verify by fetching a few rows or count
            count_result = con.execute(f"SELECT COUNT(*) FROM {table_name};").fetchone()
            if count_result:
                print(
                    f"Verification: Table '{table_name}' contains {count_result[0]} rows."
                )

            sample_rows = con.execute(f"SELECT * FROM {table_name} LIMIT 3;").fetchall()
            if sample_rows:
                print("Sample rows:")
                for row_idx, row_data in enumerate(sample_rows):
                    print(f"  Row {row_idx + 1}: {row_data}")

        print("\nConversion completed successfully!")
        print(f"DuckDB database saved to: {os.path.abspath(duckdb_file_path)}")

    except duckdb.Error as e:
        print(f"\nAn error occurred during DuckDB operation: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Convert a TSV file to a DuckDB database."
    )
    parser.add_argument(
        "--tsv-file",
        type=str,
        default=DEFAULT_TSV_FILE,
        help=f"Path to the input TSV file (default: {DEFAULT_TSV_FILE})",
    )
    parser.add_argument(
        "--db-file",
        type=str,
        default=DEFAULT_DUCKDB_FILE,
        help=f"Path for the output DuckDB file (default: {DEFAULT_DUCKDB_FILE})",
    )
    parser.add_argument(
        "--table-name",
        type=str,
        default=DEFAULT_TABLE_NAME,
        help=f"Name of the table to create in DuckDB (default: {DEFAULT_TABLE_NAME})",
    )

    args = parser.parse_args()

    # Ensure the output directory for the DuckDB file exists
    output_db_dir = os.path.dirname(args.db_file)
    if output_db_dir and not os.path.exists(output_db_dir):
        try:
            os.makedirs(output_db_dir)
            print(f"Created output directory: {output_db_dir}")
        except OSError as e:
            print(f"Error: Could not create output directory '{output_db_dir}': {e}")
            sys.exit(1)

    convert_tsv_to_duckdb(args.tsv_file, args.db_file, args.table_name)
