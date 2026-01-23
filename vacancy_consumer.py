import pyodbc
import json

def get_vacancy_knowledge(vacante_id):
    """
    Obtiene toda la información de una vacante para el agente virtual 'Sophia'.
    Realiza un JOIN entre Vacantes y CondicionesGenerales, y recupera las FAQs.
    """
    conn_str = (
        r'DRIVER={ODBC Driver 17 for SQL Server};'
        r'SERVER=;'
        r'DATABASE='
        r'UID=;'
        r'PWD=;'
        r'TrustServerCertificate=yes;'
    )

    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()

        # Consulta que une la vacante con sus condiciones y recupera FAQs en una sola ejecución lógica
        query = """
        SELECT 
            v.nombre, v.estado,
            c.sueldo, c.bono, c.horarios, c.beneficios, c.requisitos, c.documentacion
        FROM Vacantes v
        LEFT JOIN CondicionesGenerales c ON v.id = c.vacante_id
        WHERE v.id = ?
        """
        
        cursor.execute(query, vacante_id)
        row = cursor.fetchone()

        if not row:
            return None

        # Mapear resultados generales
        vacancy_data = {
            "nombre": row.nombre,
            "estado": row.estado,
            "condiciones": {
                "sueldo": float(row.sueldo) if row.sueldo else 0,
                "bono": float(row.bono) if row.bono else 0,
                "horarios": row.horarios,
                "beneficios": row.beneficios,
                "requisitos": row.requisitos,
                "documentacion": row.documentacion
            },
            "faqs": []
        }

        # Recuperar FAQs
        cursor.execute("SELECT pregunta, respuesta, palabras_clave FROM FAQ_Dinamico WHERE vacante_id = ?", vacante_id)
        faq_rows = cursor.fetchall()
        
        for faq in faq_rows:
            vacancy_data["faqs"].append({
                "pregunta": faq.pregunta,
                "respuesta": faq.respuesta,
                "palabras_clave": faq.palabras_clave
            })

        cursor.close()
        conn.close()

        return vacancy_data

    except Exception as e:
        print(f"Error al conectar o consultar la BD: {e}")
        return None

if __name__ == "__main__":
    # Ejemplo de uso
    ID_VACANTE = 1  # Cambiar por el ID real
    conocimiento = get_vacancy_knowledge(ID_VACANTE)
    
    if conocimiento:
        print(f"--- Conocimiento para la Vacante: {conocimiento['nombre']} ---")
        print(json.dumps(conocimiento, indent=4, ensure_ascii=False))
    else:
        print("Vacante no encontrada o error en la consulta.")
