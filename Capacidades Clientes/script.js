const fs = require('fs');
const path = require('path');

// Define la ruta del archivo JSON
const jsonFilePath = path.join(__dirname, 'Capacidades clientes.json');
let FileSqlInserts ="";
// Lee el archivo JSON


async function SaveFile(){

     fs.readFile(jsonFilePath, 'utf8', async (err, data) => {

    if (err) {
      console.error('Error reading the JSON file:', err);
      return;
    }
  
    try {
      
        // Parsea el contenido del archivo JSON
      
      const jsonData = JSON.parse(data);

      FileSqlInserts =  jsonData.Catalogos.map((el, i)=>{
        
          return    `INSERT INTO [Mp_Capacidades] ([Capacidad], [Fecha], [Active]) values ('${el.Nombre}','${new Date().toISOString()}',1);
          `;
      }  ).join("");

      console.error(FileSqlInserts, "=====================");

      await fs.writeFile( path.join(__dirname, "inserts.sql"),    FileSqlInserts.toString(),  ()=>{} );
    } catch (err) {
      console.error('Error parsing JSON:', err);
    }
  });

  
};

SaveFile();
