const { readFileFromS3, saveBufferToS3 } = require('../../middlewares/aws');
const { generateExcel } = require('../../utils/excel-utils');
const { updateParserDlKey, updateParserInfo } = require('../../middlewares/msc');

const ExcelJS = require('exceljs');

const parseKaepaInv = async (req, res, next, batchId) => {
    const { filename } = req.body;
    const workbook = new ExcelJS.Workbook();
    const streamFile = await readFileFromS3('imports-parser', filename);
    const wb = await workbook.xlsx.read(streamFile);
    const result = [];
    try {
        await wb.eachSheet(function (worksheet) {
            const rows = worksheet.getSheetValues();
            const header = {
                sku: 'Style', size: 'Size', quantity: 'Quantity'
            };
            result.push(header);
            let sizeArr = []

            for (const x in rows) {
                const row = rows[x];

                let sizeRow = rows[parseInt(x) + 1]

                if (row[2] && typeof row[2] === 'string' && row[2].includes('One size')) {
                    for (var i = 2; i < 25; i++) {
                        if (sizeRow[i]) {
                            sizeArr.push(sizeRow[i])
                        }
                    }
                }

                if (row[1] && typeof row[1] === 'string' && row[1].startsWith('6')) {
                    sku = row[1]
                    price = row[25]

                    for (var i = 2; i < 25; i++) {

                        let quantity

                        if (typeof row[i] === 'string') {
                            quantity = row[i].trim() || 'n/a'
                        } else if (typeof row[i] === 'number') {
                            quantity = row[i] || 'n/a'
                        } else {
                            quantity = row[i] || 'n/a'
                        }

                        size = sizeArr[i - 2]

                        if (quantity !== 'n/a') {
                            result.push({
                                sku,
                                size,
                                quantity,
                            })
                        }
                    }
                }
            }
        })

        //-----------------
        const HEADERS = Object.keys(result[0]).map((item, index) => {
            return {
                header: Object.values(result[0])[index],
                key: item
            };
        });

        const ROWS = result.slice(1,-2);
        const FILENAME = `${batchId}-parsed.xlsx`;

        const bufferData = await generateExcel([
            {
                sheetName: 'Result',
                columns: HEADERS,
                rows: ROWS
            }
        ]);

        const s3Response = await saveBufferToS3({
            keyName: `downloads/${FILENAME}`,
            contentType: 'application/octet-stream',
            base64: bufferData
        });

        if(s3Response.Location){
            await updateParserDlKey(batchId,s3Response.Location);
            res.status(200).json({success: true});
        }
        else{
            res.status(200).json({success: false});
        }

    } catch (error) {
        await updateParserInfo(batchId, error.message);
        res.status(500).json({ error: error.message });
    }

}

module.exports = parseKaepaInv;
