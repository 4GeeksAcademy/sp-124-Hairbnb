import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def import_sql():
    # Buscamos la URL de la base de datos de Render
    database_url = os.getenv('DATABASE_URL')
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        # Leemos el archivo SQL que subiste
        sql_file_path = os.path.join(os.path.dirname(__file__), '../migración_datos.sql')
        
        with open(sql_file_path, 'r') as f:
            sql_script = f.read()
        
        print("Importando datos... esto puede tardar un poco.")
        cur.execute(sql_script)
        conn.commit()
        
        cur.close()
        conn.close()
        print("✅ ¡Datos importados con éxito!")
    except Exception as e:
        print(f"❌ Error al importar: {e}")

if __name__ == "__main__":
    import_sql()