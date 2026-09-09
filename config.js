const UID =
    process.env.UID ||
    '36303231633537632d666466302d343462342d623638382d313335353638313339643330';

const PORT =
    Number(
        process.env.PORT || 8080
    );

module.exports = {
    UID,
    PORT
};