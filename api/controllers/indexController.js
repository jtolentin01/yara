
const tools = [
    {
        name: "ASIN Checker lite V2",
        subname: "asin-checker-lite-v2",
        department: "Listings",
        description: "Extract ASINs product details",
        platform: 'Amazon',
        api: true,
        uploadLimit: 'Unlimited',
        speed: '100 ASINs / 5 seconds',
        additionalInfo: 'Including SKU will only returns SKU with non-zero quantity',
        active: true,
        maintenance: false
    },
    {
        name: "Listing Loader V2",
        subname: "listing-loader-v2",
        department: "Listings",
        description: "Extract Product ID's ASIN",
        platform: 'Amazon',
        api: true,
        uploadLimit: 'Unlimited',
        speed: '100 ASINs / 5 seconds',
        additionalInfo: '',
        active: true,
        maintenance: false
    },
    {
        name: "Manage Inventory Scraper",
        subname: "manage-inventory",
        department: "Listings",
        description: "Extract Manage Inventory Data from Amazon seller central including item data and inventory",
        platform: 'Amazon',
        api: false,
        uploadLimit: 'Unlimited',
        speed: '+20%',
        additionalInfo: '',
        active: true,
        maintenance: false
    },
    {
        name: "Listing Issues",
        subname: "listing-issues-v2",
        department: "Listings",
        description: "Extract all listing issues from Amazon Seller Central",
        platform: 'Amazon',
        api: false,
        uploadLimit: 'Unlimited',
        speed: '+20%',
        additionalInfo: '',
        active: true,
        maintenance: false
    },
    {
        name: "Amazon Review V2 (BETA)",
        subname: "amazon-review-v2",
        department: "Listings",
        description: "Extract Amazon Review Data using ASINS (Beta Version - Stability Testing)",
        platform: 'Amazon',
        api: false,
        uploadLimit: 'Unlimited',
        speed: '20 ASINs / 40 seconds',
        additionalInfo: 'Running in BETA version (Testing Purposes) | using proxy to scrape',
        active: true,
        maintenance: false
    },
    {
        name: "Amazon Review Lite",
        subname: "amazon-review-lite",
        department: "Listings",
        description: "Extract Amazon Reviews using ASINS (Limited but faster)",
        platform: 'Amazon',
        api: false,
        uploadLimit: 'Unlimited',
        speed: '+50%',
        additionalInfo: '',
        active: true,
        maintenance: false
    },
    {
        name: "Amazon Page V2 (BETA)",
        subname: "amazon-page",
        department: "Listings",
        description: "Extract Amazon Page Data using ASINS (Beta Version - Stability Testing)",
        platform: 'Amazon',
        api: false,
        uploadLimit: 'Unlimited',
        speed: '20 ASINs / 40 seconds',
        additionalInfo: 'Running in BETA version (Testing Purposes) | using proxy to scrape',
        active: true,
        maintenance: false
    },
    {
        name: "Amazon Word Detector (BETA)",
        subname: "amazon-word-detector",
        department: "Listings",
        description: "Extract the matching words from Amazon Page (Beta Version - Stability Testing)",
        platform: 'Amazon',
        api: false,
        uploadLimit: 'Unlimited',
        speed: '20 ASINs / 40 seconds',
        additionalInfo: '',
        active: true,
        maintenance: false
    },
    {
        name: "Add Product V2",
        subname: "add-product-v2",
        department: "Listings",
        description: "Extract Add Product Data",
        platform: 'Amazon',
        api: true,
        uploadLimit: 'Unlimited',
        speed: '100 ASINs / 5 seconds',
        additionalInfo: '',
        active: true,
        maintenance: false
    },
    {
        name: "Edit Page V2",
        subname: "edit-page-v2",
        department: "Listings",
        description: "Extract Edit Page Data",
        platform: 'Amazon',
        api: true,
        uploadLimit: 'Unlimited',
        speed: '+80%',
        additionalInfo: '',
        active: true,
        maintenance: false
    },
    {
        name: "SIPV Scraper",
        subname: "sipv-scraper",
        department: "Listings",
        description: "Extract Product Policy Compliance Data",
        platform: 'Amazon',
        api: false,
        uploadLimit: 'Unlimited',
        speed: 'x3',
        additionalInfo: "",
        active: true,
        maintenance: false
    },
    {
        name: "Website Scraper",
        subname: "website-scraper",
        department: "Listings",
        description: "Extract inventory & pricing data from different brand websites",
        platform: 'Brand',
        api: false,
        uploadLimit: 'Unlimited',
        speed: 'x3',
        additionalInfo: "",
        active: true,
        maintenance: false
    },
    {
        name: "Edit Page Pricing",
        subname: "edit-page-pricing",
        department: "Listings",
        description: "Extract Edit Page Pricing Data",
        platform: 'Amazon',
        api: true,
        uploadLimit: 'Unlimited',
        speed: '+85%',
        additionalInfo: '',
        active: true,
        maintenance: false
    },
    {
        name: "Parent ASIN Extractor",
        subname: "get-parent",
        department: "Listings",
        description: "Extract the Parent ASIN",
        platform: 'Amazon',
        api: true,
        uploadLimit: 'Unlimited',
        speed: '+90%',
        additionalInfo: '',
        active: true,
        maintenance: false
    },
    {
        name: "Amazon Product ID Checker",
        subname: "amz-id-checker",
        department: "Listings",
        description: "Extract ASINs product IDs (UPC,EAN etc.)",
        platform: 'Amazon',
        api: true,
        uploadLimit: 'Unlimited',
        speed: '+90%',
        additionalInfo: '',
        active: true,
        maintenance: false
    },
    {
        name: "VOC Scraper V2",
        subname: "voc-v2",
        department: "Listings",
        description: "Extract VOC from seller central",
        platform: 'Amazon',
        api: false,
        uploadLimit: 'Unlimited',
        speed: '+90%',
        additionalInfo: '',
        active: true,
        maintenance: false
    },
    {
        name: "Prime Discounts Scraper",
        subname: "prime-exclusive-discount",
        department: "Listings",
        description: "Extract Latest Amazon Prime Discounts",
        platform: 'Amazon',
        api: false,
        uploadLimit: 'Unlimited',
        speed: '+50%',
        additionalInfo: '',
        active: true,
        maintenance: false
    },
    {
        name: "SKU Extractor",
        subname: "sku-extractor",
        department: "Listings",
        description: "Extract corresponding SKU using ASIN",
        platform: 'Amazon',
        api: true,
        uploadLimit: 'Unlimited',
        speed: '+50%',
        additionalInfo: "This will only return SKUs from the account that have a non-zero quantity.",
        active: true,
        maintenance: false
    },
    {
        name: "Amazon Order Scraper",
        subname: "amazon-order-scraper",
        department: "SM",
        description: "Extract Order Details from Amazon",
        platform: 'Amazon',
        api: true,
        uploadLimit: 'Unlimited',
        speed: '+20%',
        additionalInfo: '',
        active: true,
        maintenance: false
    },
    {
        name: "Get Shipment Items",
        subname: "get-shipment-items",
        department: "SM",
        description: "Extract Shipment Details from Amazon using shipment IDs",
        platform: 'Amazon',
        api: true,
        uploadLimit: 'Unlimited',
        speed: '+20%',
        additionalInfo: '',
        active: true,
        maintenance: false
    },
    {
        name: "FBA Shipments Tracking",
        subname: "fba-shipments-tracking",
        department: "SM",
        description: "Extract FBA shipments tracking details",
        platform: 'Amazon',
        api: true,
        uploadLimit: 'Unlimited',
        speed: '+20%',
        additionalInfo: '',
        active: true,
        maintenance: false
    },
    {
        name: "Get Dimensions",
        subname: "get-dimensions",
        department: "Listings",
        description: "Extract Item Dimensions from Amazon",
        platform: 'Amazon',
        api: true,
        uploadLimit: 'Unlimited',
        speed: '+20%',
        additionalInfo: '',
        active: true,
        maintenance: false
    },
    {
        name: "2DT Alternative",
        subname: "2dt-alternative",
        department: "Listings",
        description: "Extract SKU listing issues",
        platform: 'Amazon',
        api: true,
        uploadLimit: 'Unlimited',
        speed: '+10%',
        additionalInfo: '',
        active: true,
        maintenance: false
    },
    {
        name: "Price Discount Scraper",
        subname: "price-discount-scraper",
        department: "Pricing",
        description: "Extract Price Discount Error",
        platform: 'Amazon',
        api: true,
        uploadLimit: 'Unlimited',
        speed: '+20%',
        additionalInfo: '',
        active: true,
        maintenance: false
    },
    // {
    //     name: "Get Tracking No.",
    //     subname: "get-tracking-no",
    //     department: "SM",
    //     description: "Extract Tracking Numbers",
    //     platform: 'Shipment',
    //     api: false,
    //     uploadLimit: 'Unlimited',
    //     speed: '+10%',
    //     additionalInfo: '',
    //     active: true,
    //     maintenance: false
    // },
    
]

const parsers = [
    {
        name: "Inventory Parser",
        subname: "parser-inv",
        department: "Inventory",
        description: "Parsed Inventory ATS Files. Only accepts excel files",
        platform: 'Brands',
        brands: [
            {
                brandname: 'Muck Boots',
                brandcode: 'muckboots'
            },
            {
                brandname: 'Bogs',
                brandcode: 'bogs'
            },
            {
                brandname: 'Volatile',
                brandcode: 'volatile'
            },
            {
                brandname: 'Flojos',
                brandcode: 'flojos'
            },
            {
                brandname: 'Reebok Tech Running',
                brandcode: 'reebok'
            },
            {
                brandname: 'Kaepa',
                brandcode: 'kaepa'
            },
        ],
        additionalInfo: '',
        active: true,
        maintenance: false
    }
]

const scrapers = [
    {
        price: [
            {
                name: 'Asics - B2B Site',
                subname: 'asics-b2b',
                active: true,
            },
        ],
        inventory: [
            {
                name: 'Saucony - B2B Site',
                subname: 'saucony-b2b',
                active: true,
            },
            {
                name: 'Seiko - Public Site',
                subname: 'seiko-public',
                active: true
            },
            {
                name: 'Helly Hansen Sports - B2B Site',
                subname: 'hhs-b2b',
                active: true
            },
            {
                name: 'Helly Hansen Workwear - B2B Site',
                subname: 'hhw-b2b',
                active: true
            },
            {
                name: 'Silver Jeans - B2B Site',
                subname: 'silver-b2b',
                active: true
            },
            {
                name: 'Jag Jeans - B2B Site',
                subname: 'jag-b2b',
                active: true
            },
        ],
    }
]

const getListOfTools = async (req, res, next) => {
    try {
        res.status(200).json({ tools });
    } catch (error) {
        next(error);
    }
}

const getListOfParsers = async (req, res, next) => {
    try {
        res.status(200).json({ parsers });
    } catch (error) {
        next(error);
    }
}

const getListOfScrapers = async (req, res, next) => {
    try {
        res.status(200).json({ scrapers });
    } catch (error) {
        next(error);
    }
}

module.exports = { getListOfTools, tools, getListOfParsers, parsers, getListOfScrapers, scrapers };