const ExcelJS = require('exceljs');

const createExcelFile = async (headers, data) => {
    try {
        let workbook = new ExcelJS.Workbook();
        workbook.creator = 'Your Name';
        workbook.lastModifiedBy = 'Your Name';
        workbook.created = new Date();
        workbook.modified = new Date();

        let worksheet = workbook.addWorksheet('RESULTS');

        worksheet.columns = headers;

        data.forEach(datas => { worksheet.addRow(datas); });

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    } catch (error) {
        console.error('Error creating Excel file:', error);
        throw error;
    }
};

module.exports = createExcelFile;
