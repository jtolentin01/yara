const { readFileFromS3, saveBufferToS3 } = require('../../middlewares/aws');
const { generateExcel } = require('../../utils/excel-utils');
const { updateParserDlKey, updateParserInfo } = require('../../middlewares/msc');

const ExcelJS = require('exceljs');

const parseReebokInv = async (req, res, next, batchId) => {
    const { filename } = req.body;
    const workbook = new ExcelJS.Workbook();
    const streamFile = await readFileFromS3('imports-parser', filename);
    const wb = await workbook.xlsx.read(streamFile);
    const result = [];

    try {
        const header = { legacyArticle: 'Legacy Article Number', article: 'Article Number', modelNum: 'Model Number', color: 'Colorway', qty: 'Qty', size: 'Size', invDate: 'Inventory Date' };
        result.push(header);
        
        wb.eachSheet(function(worksheet, sheetId) {
            if (worksheet.name === 'NuORDER Order Data') {
                const rows = worksheet.getSheetValues();
                let sizes, details;
    
                for (let x in rows) {
                    const row = rows[x];
    
                    if (row[3] && row[3] === 'Article Number') sizes = row;
                    if (row[3] && row[3] !== 'Article Number') details = row;
    
                    if (row[18] && details !== undefined) {
                        for (let y = 24; y <= sizes.length; y++) {
                            if (sizes[y] && row[y]) {
                                result.push({
                                    legacyArticle: details[2] === null ? "" : details[2],
                                    article: details[3],
                                    modelNum: details[6],
                                    color: details[8],
                                    qty: row[y],
                                    size: sizes[y],
                                    invDate: row[18],
                                });
                            }
                        };
                    };
                }
            }
        });

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

module.exports = parseReebokInv;