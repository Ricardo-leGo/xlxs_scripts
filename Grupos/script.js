var GrupoDeCapacidades =["Cliente", "Servicio Financiero", "Transacción", "Soporte"];
const Columnas =  ["A", "B", "C", "D", "E", "F"];

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { Console } = require('console');

const workbook = XLSX.readFile('Grupos/Componentesyfuncionalidades1.xlsx');
const sheetName = workbook.SheetNames[2]; // Suponiendo que solo hay una hoja en el archivo
const worksheet = workbook.Sheets[sheetName];


// Define la letra de la columna que deseas leer
const columna = 'A'; // Por ejemplo, columna A

// Arreglo donde se guardarán los valores de la columna
let valoresColumna = [];
let objs = [];
let FuncYComp =  [];
let Grupos = [];
let GposCapacidadesData = {};

// Iterar a través de las celdas en la columna específica
for (let rowNum = 3; ; rowNum++) {
    const cellAddress =  columna + rowNum;
    const cell = worksheet[cellAddress];

    
    if ( cell?.v == "break" ) {
        break;
    }

    if(cell?.v !== undefined){

        if( !Grupos.includes(worksheet[Columnas[0]+rowNum].v) ) {
            Grupos.push(worksheet[Columnas[0]+rowNum].v);
        }

        if( !GposCapacidadesData[ worksheet[Columnas[0]+rowNum].v ] ){

            
            GposCapacidadesData[ worksheet[Columnas[0]+rowNum].v]=[{

                Capacidad:worksheet[Columnas[1]+rowNum].v,
                SubCapacidades:[{
                    SubCapacidad:worksheet[Columnas[2]+rowNum].v,
                    FuncionalidadesYComponentes:[]
                }] 
            }];

        }


        if( GposCapacidadesData[ worksheet[Columnas[0]+rowNum].v ]?.length!= 0){

            const Capacidad = GposCapacidadesData[ worksheet[Columnas[0]+rowNum].v ].find(k => k.Capacidad == worksheet[Columnas[1]+rowNum].v);

            if( Capacidad?.Capacidad!= worksheet[Columnas[1]+rowNum].v )
            {
                GposCapacidadesData[ worksheet[Columnas[0]+rowNum ].v].push(
                    {
                        Capacidad:worksheet[Columnas[1]+rowNum].v,
                        SubCapacidades:[{SubCapacidad:worksheet[Columnas[2]+rowNum].v,FuncionalidadesYComponentes:[{Funcionalidad:worksheet[Columnas[3]+rowNum].v, Componente:worksheet[Columnas[4]+rowNum].v}]}]
                    }
                );
            };

            if( Capacidad?.Capacidad == worksheet[Columnas[1]+rowNum].v )
            {
                if(    
                    GposCapacidadesData[ worksheet[Columnas[0]+rowNum].v ]?.find(k => k.Capacidad == worksheet[Columnas[1]+rowNum].v)?.SubCapacidades.some(m=>m.SubCapacidad == worksheet[Columnas[2]+rowNum].v)
                ){

                        GposCapacidadesData[ worksheet[Columnas[0]+rowNum].v ]
                        .find(k => k.Capacidad == worksheet[Columnas[1]+rowNum].v).SubCapacidades
                        .find(k => k.SubCapacidad == worksheet[Columnas[2]+rowNum].v )?.FuncionalidadesYComponentes
                        .push({Funcionalidad:worksheet[Columnas[3]+rowNum].v, Componente:worksheet[Columnas[4]+rowNum].v} );
                }else{


                    GposCapacidadesData[ worksheet[Columnas[0]+rowNum ].v].find(k => k.Capacidad == worksheet[Columnas[1]+rowNum].v).SubCapacidades.push(
                        {
                          SubCapacidad:worksheet[Columnas[2]+rowNum].v, FuncionalidadesYComponentes:[{Funcionalidad:worksheet[Columnas[3]+rowNum].v, Componente:worksheet[Columnas[4]+rowNum].v}]
                        }
                    );
                }
               
            }
        }


        FuncYComp.push(worksheet[Columnas[3]+rowNum]?.v);

        objs.push(
        {
        
            "GrupoCapacidades":worksheet[Columnas[0]+rowNum].v,
            "Capacidad": worksheet[Columnas[1]+rowNum].v,
            "SubCapacidad":worksheet[Columnas[2]+rowNum].v,
            "Funcionalidad":worksheet[Columnas[3]+rowNum].v,
            "ComponenteComun":worksheet[Columnas[4]+rowNum].v,
            "Calificacion":worksheet[Columnas[5]+rowNum]?.v

        });
        


    }
    
    valoresColumna.push(cell?.v??"");
    // Agregar el valor de la celda al arreglo
}

const GposCapacidades =  Object.keys(GposCapacidadesData).map(el=>el);
helperFuncionalidadCalificacion = [...new Set( FuncYComp.map(el=>el) )].sort((a,b)=>a<b?-1:1);
let ComponentesComunes = [...new Set( objs.map(el=>el.ComponenteComun) )].sort((a,b)=>a<b?-1:1);

let FuncionalidadesCalificaciones = [];
let ArrComponentesComunes = [];




let ArrCapacidades ="";
let GpoCapacidadesInsert= "";
let SubCapacidadInsert= "";
let FuncionalidadesInsert= "";
let ComponentesComunesInsert= "";
let ArrCapacidadesSorted =  null;
let ArrSubCapacidadesSorted =  null;



helperFuncionalidadCalificacion.forEach( (el, fcindex) => {

    FuncionalidadesCalificaciones.push({
        Funcionalidad:el,
        Calificacion:objs.find(k => k.Funcionalidad == el).Calificacion??0,
        Id:fcindex+1
    });


    FuncionalidadesInsert+=`
    INSERT INTO Funcionalidades ([Funcionalidad], Calificacion) VALUES('${el}', ${objs.find(k => k.Funcionalidad == el).Calificacion??0});
    `;

});


ComponentesComunes.forEach( (el, fcindex) => {

    ArrComponentesComunes.push({
        Componente:el,
        Id:fcindex+1
    });


    ComponentesComunesInsert+=`
    INSERT INTO ComponentesComunes ([Componente]) VALUES('${el}'});
    `;

});


GposCapacidades.forEach( (Grupo, MainIndex)=> {

// console.log(Grupo,index, GposCapacidadesData[Grupo] );

     ArrCapacidadesSorted =  GposCapacidadesData[Grupo].sort((a,b) => a.Capacidad<b.Capacidad?-1:1);
    
    GpoCapacidadesInsert += `
    INSERT INTO GrupoDeCapacidades ([Grupo]) VALUES('${Grupo}');
    `;
     ArrCapacidadesSorted.forEach((({Capacidad, SubCapacidades} , CapacidadIndex)=>{


        ArrCapacidades +=`
    INSERT INTO CapacidadDeNegocio ([Capacidad], [IdGrupoDeCapacidadesFk) VALUES ('${Capacidad}', ${MainIndex+1} );
    `

        ArrSubCapacidadesSorted =  SubCapacidades.sort( (a,b)=>a.Subcapacidad<b.SubCapacidad?-1:1);

        ArrSubCapacidadesSorted.forEach(({SubCapacidad})=>{
            
            SubCapacidadInsert += `
            INSERT INTO SubCapacidad ([SubCapacidad],IdCapacidadDeNegocioFk ) Values('${SubCapacidad}', ${CapacidadIndex+1});
            `;

        })

        

        }));
});

// console.log(GpoCapacidadesInsert );
// console.log(ArrCapacidades );
// console.log(SubCapacidadInsert);
// console.log(FuncionalidadesInsert, "===========================");
 console.log(ArrComponentesComunes, "===========================", ComponentesComunesInsert);

    async function SaveFile(){

        console.log(path.join(__dirname.replace(".."), "gpo.json"));

        try {
            
            let beforeDir =  path.join(__dirname, "..");

            let resultDirCreate="";

            // if(!fs.existsSync("JsonData")){

            //     resultDirCreate = fs.mkdirSync( path.join(beforeDir, "JsonData") );
            // }

        // await fs.writeFile( path.join(beforeDir, "JsonData/gpo.json"), JSON.stringify(GposCapacidadesData, null, 4) ,  ()=>{} );
        
        return;

        } catch (err) {
        
            console.error('Error parsing JSON:', err);
        
        }
     
   };
   
   


    // let MainData =  [], 
    helperCapacidades=[...new Set( objs.map(el=>el.Capacidad) )];
    helperSubcapacidad=[...new Set( objs.map(el=>el.SubCapacidad) )];

    SaveFile();





    

    
