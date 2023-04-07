module.exports=((sequelize, DataTypes)=>{
    const Images = sequelize.define("Images",{
        imgData:{
            type: DataTypes.BLOB('long'),
            allowNull: false
        },
    });

    return Images;
})