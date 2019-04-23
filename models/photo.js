module.exports = (sequelize, DataTypes) => {
    const Photo = sequelize.define('photo', {
        path: {
            type: DataTypes.STRING,
            allowNull: false
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        caption: {
            type: DataTypes.STRING,
            allowNull: true
        },

        username: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })

    return Photo;
}