var GrupoDeCapacidades =["Cliente", "Servicio Financiero", "Transacción", "Soporte"];
const Columnas =  ["A", "B", "C", "D", "E", "F", "G", "F"];

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const workbook = XLSX.readFile('Grupos/ComponentesYFuncionalidadesFinales.xlsx');
const sheetName = workbook.SheetNames[0]; 
const worksheet = workbook.Sheets[sheetName];

const columna = 'A'; 

let valoresColumna = [];
let objs = [];
let FuncYComp =  [];
let Grupos = [];
let GposCapacidadesData = {};

for (let rowNum = 0; ; rowNum++) {
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
            "ComponenteComun":worksheet[Columnas[4]+rowNum].v.replaceAll("\r\n", ""),
            "Calificacion":worksheet[Columnas[5]+rowNum]?.v,
            "AppReferencia":worksheet[Columnas[6]+rowNum]?.v??"NA"


        });
        

    }
    
    valoresColumna.push(cell?.v??"");
    // Agregar el valor de la celda al arreglo
}

// console.log(objs, "=========");


const GposCapacidades =  Object.keys(GposCapacidadesData).map(el=>el);
const GposCapacidadeskeys =  Object.keys(GposCapacidadesData).map((el, i)=> ({GpoCapacidad:el, Foreingkey:i+1}));

helperFuncionalidadCalificacion = [...new Set( FuncYComp.map(el=>el) )];//.sort((a,b)=>a<b?-1:1);

let ComponentesComunes = [...new Set( objs.map(el=>el.ComponenteComun) )];//.sort((a,b)=>a<b?-1:1);
let ArrAppsReferenciaraw = [...new Set( objs.map(el=>el.AppReferencia) )];//.sort((a,b)=>a<b?-1:1);
let FuncionalidadesCalificaciones = [];
let ArrComponentesComunes = [];
let ArrAppsReferencia = [];
let dataToInsertAllForeings = "", AppReferenciaInserts ="";




let ArrCapacidades ="";
let GpoCapacidadesInsert= "";
let SubCapacidadInsert= "";
let FuncionalidadesInsert= "";
let ComponentesComunesInsert= "";
let AppsReferenciaInserts= "";
let ArrCapacidadesSorted =  null;
let ArrSubCapacidadesSorted =  null;



helperFuncionalidadCalificacion.forEach( (el, fcindex) => {

    FuncionalidadesCalificaciones.push({
        Funcionalidad:el,
        Calificacion:objs.find(k => k.Funcionalidad == el).Calificacion??0,
        Id:fcindex+1
    });


    FuncionalidadesInsert+=`
    INSERT INTO Funcionalidades ([Funcionalidad], Calificacion) VALUES('${el}', ${objs.find(k => k.Funcionalidad == el).Calificacion??0});`;

});


ComponentesComunes.forEach( (el, fcindex) => {

    ArrComponentesComunes.push({
        Componente:el,
        Id:fcindex+1
    });


    ComponentesComunesInsert+=`
    INSERT INTO ComponentesComunes ([Componente]) VALUES('${el}');`;

});


ArrAppsReferenciaraw.forEach( (el, AppIndex) => {

    ArrAppsReferencia.push({
        AppReferencia:el,
        Id:AppIndex+1
    });
    

    AppsReferenciaInserts +=`
    INSERT INTO AppsReferencia ([App]) VALUES('${el}');`;

});

let FuncionalidadesArr=[];
let ComponentesArr=[];

GposCapacidades.forEach( (Grupo, MainIndex)=> {


     ArrCapacidadesSorted =  GposCapacidadesData[Grupo]//.sort((a,b) => a.Capacidad<b.Capacidad?-1:1);
    
    GpoCapacidadesInsert += `
    INSERT INTO GrupoDeCapacidades ([Grupo]) VALUES('${Grupo}');`;
     ArrCapacidadesSorted.forEach((({Capacidad, SubCapacidades} , CapacidadIndex)=>{


        ArrCapacidades +=`
    INSERT INTO CapacidadDeNegocio ([Capacidad]) VALUES ('${Capacidad}' );`

        ArrSubCapacidadesSorted =  SubCapacidades//.sort( (a,b)=>a.Subcapacidad<b.SubCapacidad?-1:1);
        ArrSubCapacidadesSorted.forEach(({SubCapacidad})=>{
            console.log(SubCapacidad, "============");
            
            SubCapacidadInsert += `
            INSERT INTO SubCapacidades ([SubCapacidad]) Values('${SubCapacidad}');`;

        })

        }));
});


helperCapacidades=[...new Set( objs.map(el=>el.Capacidad) )].map((el, i)=>({Capacidad:el, Foreingkey:i+1}));
helperSubcapacidad=[...new Set( objs.map(el=>el.SubCapacidad) )].map((el, i)=> ({SubCapacidad:el, Foreingkey:i+1}));



objs.forEach( ({GrupoCapacidades, Capacidad, SubCapacidad, Funcionalidad, ComponenteComun, Calificacion, AppReferencia}) =>{



    const GposCapacidadeskeysForeings           = GposCapacidadeskeys.find(k=> k.GpoCapacidad===GrupoCapacidades).Foreingkey;
    const helperCapacidadesForeings             = helperCapacidades.find(k => k.Capacidad === Capacidad ).Foreingkey;
    const helperSubcapacidadForeings            = helperSubcapacidad.find(k=> k.SubCapacidad === SubCapacidad ).Foreingkey;
    const FuncionalidadesCalificacionesForeings = FuncionalidadesCalificaciones.find(k=> k.Funcionalidad === Funcionalidad ).Id;
    const ArrComponentesComunesForeings         = ArrComponentesComunes.find(k => k.Componente === ComponenteComun ).Id;
    const AppReferenciaFK                       = ArrAppsReferencia.find(k => k.AppReferencia == AppReferencia ).Id;


    dataToInsertAllForeings += `
    INSERT INTO MpComponentesYFuncionalidades ([IdGrupoFK], [IdCapacidadDeNegocioFK], [IdSubCapacidadFK], [IdFuncionalidadesFK], [IdComponentesComunesFK], [Calificacion], [IdAppReferenciaFK]) VALUES(${GposCapacidadeskeysForeings-1}, ${helperCapacidadesForeings-1}, ${helperSubcapacidadForeings-1}, ${FuncionalidadesCalificacionesForeings-1}, ${ArrComponentesComunesForeings-1}, ${Calificacion??0}, ${AppReferenciaFK-1});`;

});   

//console.log(GpoCapacidadesInsert );
//console.log(ArrCapacidades );
//console.log(FuncionalidadesInsert);
//console.log(ArrComponentesComunes);
//console.log(SubCapacidadInsert);
//console.log(GposCapacidadesData);


    async function SaveFile(){


        try {
            
            let beforeDir =  path.join(__dirname, "..");

            let resultDirCreate="";

            if(!fs.existsSync("JsonData")){

                resultDirCreate = fs.mkdirSync( path.join(beforeDir, "JsonData") );
            }

        await fs.writeFile( path.join(beforeDir, "JsonData/gpo.json"), JSON.stringify(GposCapacidadesData, null, 4) ,  ()=>{} );

        await fs.writeFile( path.join(beforeDir, "JsonData/GpoCapacidadesInsert.sql"),  GpoCapacidadesInsert ,     (err)=>console.log(err, "Gpo") );
        await fs.writeFile( path.join(beforeDir, "JsonData/CapacidadesInsert.sql"),     ArrCapacidades ,           (err)=>console.log(err, "Capacidades") );
        await fs.writeFile( path.join(beforeDir, "JsonData/SubCapacidadesInsert.sql"),  SubCapacidadInsert ,       (err)=>console.log(err, "SubCapacidades") );
        await fs.writeFile( path.join(beforeDir, "JsonData/FuncionalidadesInsert.sql"), FuncionalidadesInsert ,    (err)=>console.log(err, "Funcionalidades") );
        await fs.writeFile( path.join(beforeDir, "JsonData/ComponentesInsert.sql"),     ComponentesComunesInsert , (err)=>console.log(err, "Componentes"));
        await fs.writeFile( path.join(beforeDir, "JsonData/AppsReferenciaInserts.sql"), AppsReferenciaInserts , (err)=>console.log(err, "AppsReferencia"));
        await fs.writeFile( path.join(beforeDir, "JsonData/Fc.sql"),                    dataToInsertAllForeings ,  (err)=>console.log(err, "Componentes"));
        

        return;

        } catch (err) {
        
            console.error('Error parsing :', err);
        
        }
     
   };
    SaveFile();





    

    
