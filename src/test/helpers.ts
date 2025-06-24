import { Collection, CollectionDetail } from "../client/collections";

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
    
    if (collection.assetClass !== undefined) {
      expect(typeof collection.assetClass).toBe("string");
    }
    
    if (collection.image !== undefined) {
      expect(typeof collection.image).toBe("string");
    }
    
    if (collection.order !== undefined) {
      expect(typeof collection.order).toBe("number");
    }
    
    if (collection.status !== undefined) {
      expect(typeof collection.status).toBe("string");
    }
    
    if (collection.metaData !== undefined) {
      expect(typeof collection.metaData).toBe("object");
      expect(collection.metaData).not.toBeNull();
    }
  };
  
  export const validateCollectionDetail = (collectionDetail: CollectionDetail) => {
    validateCollection(collectionDetail);
    
    expect(Array.isArray(collectionDetail.stocks)).toBe(true);
    expect(collectionDetail.stocks.length).toBeGreaterThan(0);
    
    const firstStock = collectionDetail.stocks[0];
    expect(typeof firstStock.id).toBe("string");
    expect(typeof firstStock.assetType).toBe("string");
    expect(typeof firstStock.name).toBe("string");
    expect(typeof firstStock.symbol).toBe("string");
    expect(typeof firstStock.sectorId).toBe("string");
    expect(typeof firstStock.industryId).toBe("string");
    expect(typeof firstStock.updatedDate).toBe("string");
    expect(typeof firstStock.active).toBe("boolean");
  };