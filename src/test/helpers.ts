import { Collection, CollectionDetail } from "../client/collections";
import { Stock } from "../client/stocks";

export const validateCollection = (collection: Collection) => {
    expect(typeof collection.id).toBe("string");
    expect(typeof collection.title).toBe("string");
    expect(typeof collection.imageUrl).toBe("string");
    expect(typeof collection.avatarUrl).toBe("string");
    expect(typeof collection.numStocks).toBe("number");
  
    if (collection.description !== undefined) {
      expect(typeof collection.description).toBe("string");
    }
    
    if (collection.region !== undefined) {
      expect(Array.isArray(collection.region)).toBe(true);
      collection.region.forEach(region => {
        expect(typeof region).toBe("string");
      });
    }

    if (collection.locale != null) {
      expect(typeof collection.locale).toBe("string");
    }
    
    if (collection.assetClass != null) {
      expect(typeof collection.assetClass).toBe("string");
    }
    
    if (collection.image != null) expect(typeof collection.image).toBe("string");
    if (collection.order != null) expect(typeof collection.order).toBe("number");
    if (collection.status != null) expect(typeof collection.status).toBe("string");
    if (collection.metaData != null) expect(typeof collection.metaData).toBe("object");
  };
  
  export const validateCollectionDetail = (collectionDetail: CollectionDetail) => {
    validateCollection(collectionDetail);
    
    expect(Array.isArray(collectionDetail.stocks)).toBe(true);
    expect(collectionDetail.stocks.length).toBeGreaterThan(0);
    
    collectionDetail.stocks.forEach(validateStockLite);
  };

  function validateStockLite(s: Stock) {
    expect(typeof s.id).toBe("string");
    expect(typeof s.assetType).toBe("string");
    expect(typeof s.name).toBe("string");
    expect(typeof s.symbol).toBe("string");
    expect(typeof s.sectorId).toBe("string");
    expect(typeof s.industryId).toBe("string");
    expect(typeof s.updatedDate).toBe("string");
    expect(typeof s.active).toBe("boolean");
  }