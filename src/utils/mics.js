export const formatDate = (inpDate) => {
    let convertedDate = new Date(inpDate);
    let month = convertedDate.getMonth() + 1;
    let day = convertedDate.getDate();
    let year = convertedDate.getFullYear();
    if (day < 10) {
        day = '0' + day;
    }
    if (month < 10) {
        month = '0' + month;
    }
    let shortDate = `${day}-${month}-${year} 00:00:00`;

    return shortDate;
};

export const formatDateTime = (inpDate) => {
    let convertedDate = new Date(inpDate);
    let month = convertedDate.getMonth() + 1;
    let day = convertedDate.getDate();
    let year = convertedDate.getFullYear();
    let hour = convertedDate.getHours();
    let minute = convertedDate.getMinutes();
    let seconds = convertedDate.getSeconds();
    if (day < 10) {
        day = '0' + day;
    }
    if (month < 10) {
        month = '0' + month;
    }
    let shortDate = `${day}-${month}-${year} ${hour}:${minute}:${seconds}`;

    return shortDate;
};