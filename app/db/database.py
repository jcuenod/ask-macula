import duckdb
import asyncio
import queue
import os
import threading

DB_PATH = os.path.join(os.path.dirname(os.path.realpath(__file__)), "macula.duckdb")
POOL_SIZE = 5
QUERY_TIMEOUT = 5.0  # seconds

_pool_initialized = False
db_connection_pool = queue.Queue(maxsize=POOL_SIZE)


def _initialize_pool():
    """
    Populates the connection pool with new DuckDB connections.
    This should be called once, typically at application startup.
    """
    global _pool_initialized
    if _pool_initialized:
        return

    for _ in range(POOL_SIZE):
        try:
            conn = duckdb.connect(database=DB_PATH, read_only=True)
            db_connection_pool.put_nowait(conn)
        except Exception as e:
            print(f"Error creating connection for pool: {e}")
            pass
    _pool_initialized = True


_initialize_pool()


def get_db_connection():
    """
    Retrieves a database connection from the pool.
    Blocks if the pool is empty, waiting for a connection to be returned.
    Includes a timeout to prevent indefinite blocking.
    """
    try:
        # Wait for up to 5 seconds for a connection to become available.
        return db_connection_pool.get(block=True, timeout=5)
    except queue.Empty:
        # This occurs if the pool is exhausted and no connection becomes available within the timeout period.
        raise TimeoutError(
            f"Could not get a DB connection from pool (size: {POOL_SIZE}) within timeout."
        )


def return_db_connection(conn):
    """
    Returns a database connection to the pool.
    """
    if conn:
        try:
            db_connection_pool.put_nowait(conn)
        except queue.Full:
            # This might happen if more connections are returned than taken,
            # or if connections are created outside the pool and then returned.
            # In a well-behaved system with a fixed-size pool, this should ideally not occur.
            # If it does, close the connection to prevent leaks.
            print("Warning: Connection pool is full. Closing an extraneous connection.")
            conn.close()


def shutdown_db_pool():
    """Closes all connections in the pool."""
    global _pool_initialized
    print("Shutting down database connection pool...")
    while not db_connection_pool.empty():
        try:
            conn = db_connection_pool.get_nowait()
            conn.close()
        except queue.Empty:
            break  # Pool is empty
        except Exception as e:
            print(f"Error closing a connection during shutdown: {e}")
    _pool_initialized = False  # Reset initialization flag
    print("Database connection pool shut down.")


def blocking_db_call(query):
    conn = None
    timer = threading.Timer(QUERY_TIMEOUT, lambda: conn.interrupt())
    try:
        conn = get_db_connection()

        timer.start()
        results = conn.execute(query)

        if not results.description:
            return []

        columns = [col_desc[0] for col_desc in results.description]
        row_dicts = [dict(zip(columns, row)) for row in results.fetchall()]

        return row_dicts
    finally:
        timer.cancel()
        if conn:
            return_db_connection(conn)


async def run_query(query):
    """
    Run a query on the database asynchronously and return the results.
    """
    return await asyncio.to_thread(blocking_db_call, query)
