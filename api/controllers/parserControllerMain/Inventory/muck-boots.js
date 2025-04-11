const { readFileFromS3, saveBufferToS3 } = require('../../middlewares/aws');
const { generateExcel } = require('../../utils/excel-utils');
const {updateParserDlKey,updateParserInfo} = require('../../middlewares/msc');

const ExcelJS = require('exceljs');

const parseMuckBootsInv = async (req, res, next, batchId) => {
    const { filename } = req.body;
    const workbook = new ExcelJS.Workbook();
    const streamFile = await readFileFromS3('imports-parser', filename);
    const wb = await workbook.xlsx.read(streamFile);
    const result = [];
    let header = [];
    try {
        const defaultHeader = { brand: 'Brand', activeStatus: 'Active Status', style: 'Style', width: 'Color/Width', size: 'Size', qty: 'Qty' };
        result.push(defaultHeader);

        wb.eachSheet(function (worksheet) {
            if (worksheet.name === 'LOGAN') {
                const rows = worksheet.getSheetValues();

                for (x = 7; x <= rows.length; x++) {
                    let row = rows[x]
                    header = rows[6]

                    if (row && row[1] !== undefined && row[2] !== undefined && row[3] !== undefined && row[4] !== undefined) {
                        for (let y = 5; y < 44; y++) {
                            let tempQty = 0;
                            if (typeof row[y] === 'number') tempQty = row[y]

                            result.push({
                                brand: row[1],
                                activeStatus: row[2],
                                style: row[3],
                                width: row[4],
                                size: header[y],
                                qty: tempQty
                            })
                        }
                    }
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

module.exports = parseMuckBootsInv;