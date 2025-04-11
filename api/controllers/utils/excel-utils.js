const ExcelJS = require('exceljs');

const createExcelFile = async (headers, data) => {
    try {
        let workbook = new ExcelJS.Workbook();
        workbook.creator = 'Yara';
        workbook.lastModifiedBy = 'Yara';
        workbook.created = new Date();
        workbook.modified = new Date();

        let worksheet = workbook.addWorksheet('Results');

        worksheet.columns = headers;

        data.forEach(datas => { worksheet.addRow(datas); });

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    } catch (error) {
        console.error('Error creating Excel file:', error);
        throw error;
    }
};

const createExcelFileForReview = async (headers, data) => {
    try {
        let workbook = new ExcelJS.Workbook();
        workbook.creator = 'Yara';
        workbook.lastModifiedBy = 'Yara';
        workbook.created = new Date();
        workbook.modified = new Date();

        let worksheet = workbook.addWorksheet('Results');

        worksheet.columns = headers;

        const flattenData = data.map(item => ({
            ...item,
            'salesRank': item.salesRank || '-',
            'reviews.review1': item.reviews?.review1 || '',
            'reviews.review2': item.reviews?.review2 || '',
            'reviews.review3': item.reviews?.review3 || '',
            'reviews.review4': item.reviews?.review4 || '',
            'reviews.review5': item.reviews?.review5 || '',
            'reviews.review6': item.reviews?.review6 || '',
            'reviews.review7': item.reviews?.review7 || '',
            'reviews.review8': item.reviews?.review8 || '',
            'reviews.review9': item.reviews?.review9 || '',
            'reviews.review10': item.reviews?.review10 || '',
        }));

        flattenData.forEach(row => worksheet.addRow(row));

        headers.forEach((header, index) => {
            worksheet.getColumn(index + 1).width = header.width;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    } catch (error) {
        console.error('Error creating Excel file:', error);
        throw error;
    }
};

const createExcelFileForReview2 = async (headers, data) => {
    try {
        let workbook = new ExcelJS.Workbook();
        workbook.creator = 'Yara';
        workbook.lastModifiedBy = 'Yara';
        workbook.created = new Date();
        workbook.modified = new Date();

        let worksheet = workbook.addWorksheet('Results');

        worksheet.columns = headers;

        const flattenData = data.map(item => {
            const reviewFields = item.reviews?.reduce((acc, review, index) => {
                acc[`reviews.review${index + 1}`] = review || '';
                return acc;
            }, {});

            return {
                ...item,
                'salesRank': item.salesRank || '-',
                ...reviewFields, 
            };
        });

        flattenData.forEach(row => worksheet.addRow(row));

        headers.forEach((header, index) => {
            worksheet.getColumn(index + 1).width = header.width;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    } catch (error) {
        console.error('Error creating Excel file:', error);
        throw error;
    }
};

const createExcelFileWithMultipleTabs = async (headers, data, tabNames) => {
    try {
        let workbook = new ExcelJS.Workbook();
        workbook.creator = 'Yara';
        workbook.lastModifiedBy = 'Yara';
        workbook.created = new Date();
        workbook.modified = new Date();

        data.forEach((dataArray, index) => {
            let worksheetName = tabNames[index] || `Sheet${index + 1}`;
            let worksheet = workbook.addWorksheet(worksheetName);
            worksheet.columns = headers;

            dataArray.forEach(datas => {
                let rowValues = headers.map(header => datas[header.key]);
                worksheet.addRow(rowValues);
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    } catch (error) {
        console.error('Error creating Excel file:', error);
        throw error;
    }
};

const generateExcel = async (dataArray = defaultData) => {
    const workbook = new ExcelJS.Workbook();
    for (let x in dataArray) {
        let data = dataArray[x]
        const worksheet = workbook.addWorksheet(data.sheetName)
        worksheet.columns = data.columns;
        worksheet.addRows(data.rows);
        worksheet.getRow(1).font = { bold: true };
    }
    const buffer = await workbook.xlsx.writeBuffer()
    return buffer
}

const createExcelFileExec = async (headersArray, data, tabNames) => {
    try {
        let workbook = new ExcelJS.Workbook();
        workbook.creator = 'Yara';
        workbook.lastModifiedBy = 'Yara';
        workbook.created = new Date();
        workbook.modified = new Date();

        data.forEach((dataArray, index) => {
            let worksheetName = tabNames[index] || `Sheet${index + 1}`;
            let worksheet = workbook.addWorksheet(worksheetName);

            let currentHeaders = headersArray[index] || [];

            if (Array.isArray(dataArray[0]) || typeof dataArray[0] !== 'object') {
                dataArray.forEach(row => {
                    worksheet.addRow(Array.isArray(row) ? row : [row]);
                });
            } else {
                worksheet.columns = currentHeaders.map(header => ({
                    header: header.label,
                    key: header.key,
                    width: header.width || 15
                }));

                dataArray.forEach(datas => {
                    let rowValues = currentHeaders.map(header => datas[header.key]);
                    worksheet.addRow(rowValues);
                });
            }
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    } catch (error) {
        console.error('Error creating Excel file:', error);
        throw error;
    }
};




module.exports = { createExcelFile, createExcelFileWithMultipleTabs, createExcelFileForReview, generateExcel, createExcelFileExec, createExcelFileForReview2 };
