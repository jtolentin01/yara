
const actualErrors = [
    {
        errorId: "ProductConditionNew_ConditionNotMetClientError",
        errorName: "Item condition",
        errorDescription: "Items must be in New condition. Please update to a SKU in New condition."
    },
    {
        errorId: "SafeToAdvertise_ConditionNotMetClientError",
        errorName: "Restricted ASIN",
        errorDescription: "The ASIN is not eligible for Price Discounts due to being in a restricted category or otherwise considered not safe to promote."
    },
    {
        errorId: "ReviewRating_BelowThresholdClientError",
        errorName: "ASIN rating",
        errorDescription: "This ASIN’s rating does not meet the minimum requirement. Please remove this ASIN from the Price Discount."
    },
    {
        errorId: "Price_BelowThresholdClientError",
        errorName: "Increase your Discounted Price",
        errorDescription: "You cannot offer a discount that's greater than 80%."
    },
    {
        errorId: "Price_AboveThresholdClientError",
        errorName: "Lower your Discounted Price",
        errorDescription: "The discounted price entered is invalid. The discounted price must be lower than the 30-day low price. Please update to a valid discounted price."
    },
    {
        errorId: "HasNonOverlappingPromotions_ConditionNotMetClientError",
        errorName: "Price conflict",
        errorDescription: "Your discount will not apply to this SKU during the times below because a better price is being offered. Check if this SKU is part of another Price Discount or other promotion."
    },
    {
        errorId: "HasNonOverlappingPromotions_ConditionNotMetClientError_DEAL_PRICE_CONFLICT",
        errorName: "Overlapping Promotion",
        errorDescription: "This Price Discount is suppressed due to a Lightning Deal that is currently running on the SKU or scheduled to run within the next 6 hours. Your Price Discount will reactivate after the Lightning Deal ends."
    },
    {
        errorId: "HasNonOverlappingPromotions_ConditionNotMetClientError_COUPON_STACKING",
        errorName: "Stacking Promotion",
        errorDescription: "Stacking Promotion"
    },
    {
        errorId: "Budget_AboveThresholdClientError",
        errorName: "Committed units sold",
        errorDescription: "The Price Discount is no longer active on this SKU due to selling over 90% of the committed units. To reactivate the Price Discount, please increase the number of committed units."
    },
    {
        errorId: "MinPercentOffPrice_AboveThresholdClientError_Upcoming",
        errorName: "Price below Minimum Discounted Price",
        errorDescription: "This discount is suppressed because the percent off amount would result in a discounted price below your Minimum Discounted Price. Please lower the Minimum Discounted Price to be equal to or below your current discounted price."
    },
    {
        errorId: "MinPercentOffPrice_AboveThresholdClientError_Running",
        errorName: "Price below Minimum Discounted Price",
        errorDescription: "This discount is suppressed because the percent off amount would result in a discounted price below your Minimum Discounted Price. Please lower the Minimum Discounted Price to be equal to or below your current discounted price."
    },
    {
        errorId: "DiscountPercentage_BelowThresholdClientError",
        errorName: "Increase your percent off amount",
        errorDescription: "The percent off amount entered is invalid. The percent off amount must result in a discounted price lower than the 30-day low price. Please update the percent off amount to be equal to or greater than the minimum percent off required."
    },
    {
        errorId: "HasReferencePrice_ConditionNotMetClientError",
        errorName: "No Reference Price",
        errorDescription: "This ASIN does not have a reference price and therefore cannot run as a Prime exclusive Price Discount."
    },
    {
        errorId: "SellerCancellationRate_AboveThresholdClientError",
        errorName: "Pre-fulfillment Cancel Rate",
        errorDescription: "To run Price Discounts on Merchant fulfilled SKUs, you must have a Pre-fulfillment Cancel Rate less than or equal to {threshold}%."
    },
    {
        errorId: "SellerLateDispatchRate_AboveThresholdClientError",
        errorName: "Late Shipment Rate",
        errorDescription: "To run Price Discounts on Merchant fulfilled SKUs, you must have a Late Shipment Rate less than or equal to {threshold}%."
    },
    {
        errorId: "SellerOrderDefectRate_AboveThresholdClientError",
        errorName: "Order Defect Rate",
        errorDescription: "To run Price Discounts on Merchant fulfilled SKUs, you must have an Order Defect Rate less than or equal to {threshold}%."
    },
    {
        errorId: "SellerReserveDisbursementPolicy_BelowThresholdClientError",
        errorName: "Disbursement reserve policy",
        errorDescription: "To run Price Discounts on Merchant fulfilled SKUs, your disbursement reserve policy should be {threshold} days or higher."
    },
    {
        errorId: "SellerReserveDisbursementPolicyMissing_ConditionNotMetClientError",
        errorName: "Disbursement reserve policy",
        errorDescription: "To run Price Discounts on Merchant fulfilled SKUs, your disbursement reserve policy must be set."
    },
    {
        errorId: "ShippingPrice_AboveThresholdClientError",
        errorName: "SKU does not offer free shipping",
        errorDescription: "Price Discounts on Merchant fulfilled SKUs are required to offer free shipping. Please update the SKU to offer free shipping or change to a different SKU that offers free shipping."
    },
    {
        errorId: "HasBuyableOffer_ConditionNotMetClientError",
        errorName: "SKU not active",
        errorDescription: "This SKU is not buyable due to having no available inventory. Please add inventory to this SKU or change to a SKU that has available inventory."
    }
];


const suppressedErrors = [
    "ProductConditionNew_ConditionNotMetClientError",
    "HasNonOverlappingPromotions_ConditionNotMetClientError",
    "HasNonOverlappingPromotions_ConditionNotMetClientError_DEAL_PRICE_CONFLICT",
    "Price_BelowThresholdClientError",
    "Price_AboveThresholdClientError",
    "Budget_AboveThresholdClientError",
    "MinPercentOffPrice_AboveThresholdClientError_Running",
    "DiscountPercentage_BelowThresholdClientError",
    "HasReferencePrice_ConditionNotMetClientError",
    "SellerCancellationRate_AboveThresholdClientError",
    "SellerLateDispatchRate_AboveThresholdClientError",
    "SellerOrderDefectRate_AboveThresholdClientError",
    "SellerReserveDisbursementPolicy_BelowThresholdClientError",
    "ShippingPrice_AboveThresholdClientError",
    "HasBuyableOffer_ConditionNotMetClientError",
    "SellerReserveDisbursementPolicyMissing_ConditionNotMetClientError",
    "IsPrimeEligible_ConditionNotMetClientError"
]

module.exports = {
    actualErrors,
    suppressedErrors
};

