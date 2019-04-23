module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user', {
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { isEmail: true}
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
};