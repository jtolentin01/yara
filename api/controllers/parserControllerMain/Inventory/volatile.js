const { readFileFromS3, saveBufferToS3 } = require('../../middlewares/aws');
const { generateExcel } = require('../../utils/excel-utils');
const { updateParserDlKey, updateParserInfo } = require('../../middlewares/msc');

const ExcelJS = require('exceljs');

const parseVolatileInv = async (req, res, next, batchId) => {
    const { filename } = req.body;
    const workbook = new ExcelJS.Workbook();
    const SHEET_ID = 2;
    const streamFile = await readFileFromS3('imports-parser', filename);
    const wb = await workbook.xlsx.read(streamFile);
    const ws = wb.getWorksheet(SHEET_ID);
    const rows = ws.getSheetValues();

    const result = [];
    try {
        const header = { styleColor: 'Style Color', styleName: 'Style Name', categoryPage: 'Category Page', season: 'Season', wholesale: 'Wholesale', status: 'Status', size: 'Size', qty: 'Quantity' };
        result.push(header);

        let sizes = [];
        let qtys = [];
        const obj = {};
        for (const x in rows) {
            const row = rows[x];

            if (row && row[6] === 'SIZES') {
                obj.styleColor = row[1];
                obj.styleName = row[2];
                obj.categoryPage = row[3];
                obj.wholesale = row[4];
                obj.retail = row[5];

                sizes = row;
            }

            if (row && row[6] !== 'SIZES' && row[6] !== 'ORDER') {
                qtys = row;

                for (let y = 7; y <= 16; y++) {
                    const size = sizes[y];
                    const qty = qtys[y];
                    if (size) {
                        result.push({
                            styleColor: obj.styleColor,
                            styleName: obj.styleName,
                            categoryPage: obj.categoryPage,
                            retail: obj.retail,
                            wholesale: obj.wholesale,
                            status: row[6],
                            size,
                            qty: qty < 1 || !qty ? '-' : qty
                        });
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

module.exports = parseVolatileInv;