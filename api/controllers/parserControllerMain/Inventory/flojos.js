const { readFileFromS3, saveBufferToS3 } = require('../../middlewares/aws');
const { generateExcel } = require('../../utils/excel-utils');
const { updateParserDlKey, updateParserInfo } = require('../../middlewares/msc');

const ExcelJS = require('exceljs');

const parseFlojosInv = async (req, res, next, batchId) => {
    const { filename } = req.body;
    const SHEET_NAME = 'AT ONCE ORDER FORM';
    const workbook = new ExcelJS.Workbook();
    const streamFile = await readFileFromS3('imports-parser', filename);

    const wb = await workbook.xlsx.read(streamFile);
    const ws = wb.getWorksheet(SHEET_NAME);
    const rows = ws.getSheetValues();
    const result = [];


    try {
        let header = { style: 'Style Color', styleName: 'Style Name', category: 'Category', season: 'Season', wholesale: 'Wholesale', statusCol: 'Status', size: 'Size', quantity: 'Quantity' }
        result.push(header);
        let sizes

        for (let x in rows) {
            let row = rows[x]

            if (row[6] === 'SIZES') sizes = row

            if (row[6] === 'ATS AT ONCE') {
                style = row[1]
                styleName = row[2]
                category = row[3]
                wholesale = row[4] || '0'
                statusCol = row[6]

                for (var i = 7; i < 20; i++) {
                    let size = sizes[i]
                    let quantity = row[i] || '0'

                    if (size) {
                        result.push({
                            style,
                            styleName,
                            category,
                            wholesale,
                            statusCol,
                            size,
                            quantity
                        })
                    }
                }
            }
        }

        //-----------------------

        const HEADERS = Object.keys(result[0]).map((item, index) => {
            return {
                header: Object.values(result[0])[index],
                key: item
            };
        });

        const ROWS = result.slice(1);
        const FILENAME = `${batchId}-parsed.xlsx`;

        let bufferData = await generateExcel([
            {
                sheetName: 'Result',
                columns: HEADERS,
                rows: ROWS
            }
        ]);

        let s3Response = await saveBufferToS3({
            keyName: `downloads/${FILENAME}`,
            contentType: 'application/octet-stream',
            base64: bufferData
        });

        if (s3Response.Location) {
            await updateParserDlKey(batchId, s3Response.Location);
            res.status(200).json({ success: true });
        }
        else {
            res.status(200).json({ success: false });
        }

    } catch (error) {
        await updateParserInfo(batchId, error.message);
        res.status(500).json({ error: error.message });
    }
}

module.exports = parseFlojosInv;