const { generateLWAaccessToken, getMarketPlaceIDs } = require('../middlewares/amz-api');
const uploadFileToS3 = require('../middlewares/aws');
const createExcelFile = require('../utils/excel-utils');

const asinCheckerLiteInit = async (req, res) => {
    const { productType, productIDs } = req.body;

    try {
        const amazonApiToken = await generateLWAaccessToken();

        const asinCheckerLiteExec = (amazonApiToken, productID, maxRetries = 3) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = 'https://sellingpartnerapi-na.amazon.com/catalog/2022-04-01/items';
                const queryStringArr = [
                    `identifiers=${productID}`,
                    `identifiersType=${productType}`,
                    `marketplaceIds=${getMarketPlaceIDs('US')}`,
                    `includedData=identifiers,attributes,summaries,relationships,productTypes,salesRanks`,
                    `pageSize=20`
                ];
                const queryString = queryStringArr.join('&');
                const url = `${baseUrl}?${queryString}`;
                const options = {
                    method: 'get',
                    headers: { 'x-amz-access-token': amazonApiToken }
                };

                const fetchData = async (retryCount) => {
                    try {
                        const response = await fetch(url, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const data = await response.json();
                        resolve(data);
                    } catch (error) {
                        if (retryCount > 0) {
                            fetchData(retryCount - 1);
                        } else {
                            reject(error);
                        }
                    }
                };

                fetchData(maxRetries);
            });
        };

        const results = await Promise.all(productIDs.map(productID => asinCheckerLiteExec(amazonApiToken, productID)));

        const extractResult = (data) => {
            const asinArray = [];

            data.forEach((entry) => {
                if (entry.items && entry.items[0] && entry.items[0].asin) {
                    const parentAsin = entry.items[0].relationships[0]?.relationships[0]?.parentAsins ? entry.items[0].relationships[0]?.relationships[0]?.parentAsins[0] : entry.items[0].relationships[0]?.relationships[0]?.childAsins ? 'n/a' : 'n/a'
                    asinArray.push({
                        asin: entry.items[0].asin,
                        link: `https://sellercentral.amazon.com/abis/listing/syh?asin=${entry.items[0].asin}&ref_=xx_catadd_dnav_xx#offer`,
                        title: entry.items[0].summaries[0].itemName.replace(/\\"/g, '"'),
                        brand: entry.items[0].summaries[0].brand,
                        gender: entry.items[0].attributes.target_gender[0].value || entry.items[0].attributes.department[0].value || 'n/a',
                        color: entry.items[0].summaries[0].color,
                        size: entry.items[0].summaries[0].size,
                        productTypes: entry.items[0].productTypes[0].productType,
                        salesRanks: entry.items[0].salesRanks[0].classificationRanks[0]?.rank,
                        salesRanks2: entry.items[0].salesRanks[0].displayGroupRanks[0]?.rank,
                        parentasin: entry.items[0].relationships[0]?.relationships[0]?.parentAsins ? entry.items[0].relationships[0]?.relationships[0]?.parentAsins[0] : entry.items[0].relationships[0]?.relationships[0]?.childAsins ? 'n/a' : 'n/a',
                        standalone: parentAsin === 'n/a' ? 'Yes' : 'No'
                    });
                }
            });

            return asinArray;
        };

        const initialResult = extractResult(results);
        const extractUniqueParentAsin = (data) => {
            const uniqueParentAsins = [];

            data.forEach((entry) => {
                const parentAsin = entry.parentasin;

                if (parentAsin && !uniqueParentAsins.includes(parentAsin)) {
                    uniqueParentAsins.push(parentAsin);
                }
            });

            return uniqueParentAsins;
        };

        const uniqueParentAsins = extractUniqueParentAsin(extractResult(results));
        const parentAsinResults = await Promise.all(uniqueParentAsins.map(parentAsin => asinCheckerLiteExec(amazonApiToken, parentAsin)));
        const parentResult = extractResult(parentAsinResults);

        const mergedResults = initialResult.map(item => {
            if (item.parentasin && item.standalone === 'No') {
                const parentItem = parentResult.find(parent => parent.asin === item.parentasin);
                if (parentItem) {
                    return {
                        ...item,
                        parentTitle: parentItem.title,
                        parentBrand: parentItem.brand,
                        parentGender: parentItem.gender,
                        parentProductType: parentItem.productTypes
                    };
                }
            }
            return item;
        });

        let headers = [
            { header: "ASIN", key: "asin", width: 15 },
            { header: "Link", key: "link", width: 15 },
            { header: "Title", key: "title", width: 25 },
            { header: "Brand", key: "brand", width: 10 },
            { header: "Gender", key: "gender", width: 10 },
            { header: "Color", key: "color", width: 10 },
            { header: "Size", key: "size", width: 10 },
            { header: "Product Types", key: "productTypes", width: 10 },
            { header: "Sales Rank (Sub)", key: "salesRanks", width: 10 },
            { header: "Sales Rank", key: "salesRanks2", width: 10 },
            { header: "Parent ASIN", key: "parentasin", width: 10 },
            { header: "Standalone", key: "standalone", width: 10 },
            { header: "Parent Title", key: "parentTitle", width: 10 },
            { header: "Parent Brand", key: "parentBrand", width: 10 },
            { header: "Parent Gender", key: "parentGender", width: 10 },
            { header: "Parent Product Type", key: "parentProductType", width: 10 },


        ];
        let renderFile = await createExcelFile(headers, mergedResults);
        await uploadFileToS3('downloads', renderFile, 'test-result.xlsx');

        res.status(200).json(mergedResults);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = asinCheckerLiteInit;
