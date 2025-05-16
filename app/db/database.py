# connect to the duckdb database
import duckdb

# read_csv_auto('data/macula.tsv')

connection = duckdb.connect(database=":memory:")
connection.execute("""
    CREATE TABLE
        macula AS
        SELECT
            *
        FROM
            read_csv('app/db/macula-greek-SBLGNT.tsv', delim = '\t', header = true, types={'strong': 'VARCHAR'});
""")

# rename the "xml:id" column to "macula_id"
connection.execute("""
    ALTER TABLE macula
    RENAME COLUMN "xml:id" TO macula_id;
""")
# rename class column to part_of_speech
connection.execute("""
    ALTER TABLE macula
    RENAME COLUMN class TO part_of_speech;
""")


def run_query(query):
    """
    Run a query on the database and return the results.
    """
    # Execute the query
    relation = connection.execute(query)

    # If the query doesn't return rows (e.g., DDL/DML without a RETURNING clause),
    # relation.description might be None or an empty list.
    # In such cases, there are no columns/rows to return with names.
    if not relation.description:
        return []

    # Get column names from the description
    columns = [col_desc[0] for col_desc in relation.description]

    # Fetch all rows and convert each row to a dictionary
    return [dict(zip(columns, row)) for row in relation.fetchall()]
