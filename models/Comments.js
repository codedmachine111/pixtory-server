module.exports=((sequelize, DataTypes)=>{
    const Comments = sequelize.define("Comments",{
        commentText:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        username:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        PostId:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });

    return Comments;
})