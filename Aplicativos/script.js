const fs = require('fs');
const path = require('path');

// Define la ruta del archivo JSON

// Lee el archivo JSON

const ReadJson = async function(ruta=""){
    const jsonFilePath = path.join(__dirname, ruta);
    let FileSqlInserts ="";
    let StatusInserts  ="";

    const file = await fs.readFile(ruta, 'utf-8',  async function(err, data){

        if (err) {
          console.error('Error reading the JSON file:', err);
          return;
        }

         try {
          
             // Parsea el contenido del archivo JSON      
           const jsonData = JSON.parse(data);


           const StatusAplicativos =  [ ...new Set(jsonData.map(el =>el.Estatus))  ].map((el, i)=> ({Status:el, Id:i+1}) );
           
           StatusInserts = StatusAplicativos.map((el, i)=> `INSERT INTO [EstatusAplicativo] ([Estatus],[Order],[DisplayName]) values (1,${i+1},'${el.Status}');
           `).join("")
            console.log(StatusInserts);


            FileSqlInserts =  jsonData.map(el=>{
                return    `INSERT INTO [Aplicativos] (Nombre, [Salud], [Peso], [Factor], [IdEstatusFK]) values ('${el.Aplicativos}',${el.Salud},${el.Peso},${el.Factor},${ StatusAplicativos.find( k=>k.Status == el.Estatus ).Id } );
`;
            }  ).join("");
            
            await fs.writeFile( path.join(__dirname, "inserts.sql"),    (StatusInserts+FileSqlInserts).toString(),  ()=>{} );

         } catch (err) {
           console.error('Error parsing JSON:', err);
         }



    } );

}


ReadJson('Aplicativos/Aplicativos.json')





