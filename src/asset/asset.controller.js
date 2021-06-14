const Asset = require("./models/asset.model.js");
const AssetProperties = require("./models/asset_properties.model.js");
const {
  assetValidator,
  getUsersAssetsValidator,
  updateAssetValidator,
  deleteAssetValidator,
  getAssetByIdValidator,
} = require("./validators/validator");
const apiResponse = require("../user/helpers/apiResponse");

const handlerError = (res, err) => {
  if (err.isJoi) {
    console.log(err.details);
    return apiResponse.validationErrorWithData(res, "Validation Error", {
      details: err.details.map((detail) => ({ message: detail.message })),
    });
  }
  return apiResponse.ErrorResponse(res, "Internal Server Error");
};

const createAsset = async (req, res, next) => {
  try {
    const data = await assetValidator.validateAsync(req.body);
    const asset = new Asset({...(data.asset),ownerId:data.ownerId,});
    const assetRef = await asset.save();
    console.log(assetRef);
    const assetProps = new AssetProperties({
      assetId: assetRef._id,
      properties: data.asset.properties,
      stats: data.asset.stats,
      levels: data.assetlevels,
    });
    const assetPropsRef = await assetProps.save();
    assetRef.meta = assetPropsRef._id;
    await assetRef.save();
    return apiResponse.successResponseWithData(
      res,
      "Asset created sucessfully !..",
      assetRef
    );
  } catch (err) {
    console.log(err);
    return handlerError(res, err);
  }
};


const updateAsset = async (req,res,next) => {
    
  try{
      const data = await updateAssetValidator.validateAsync(req.body);
      const updatedAsset = await Asset.findByIdAndUpdate(data.assetId,data.asset,{new:true}); 
      return apiResponse.successResponseWithData(res,"Updated Sucessfully",updatedAsset);
      // const asset =  
  }catch(err){
    console.log(err);
    return handlerError(res,err);
  }

}

const deleteAsset = async (req,res,next) => {
  try{
      const data = await deleteAssetValidator.validateAsync(req.body);
      const asset = await Asset.findById(data.assetId);
      await asset.remove();
      return apiResponse.successResponse(res,"Deleted Sucessfully");
  }catch(err){
    console.log(err);
    return handlerError(res,err);
  }

}

const getAllAssets = async (req, res, next) => {
  try {
    const assets = await Asset.find({}).populate("meta");
    console.log(assets);
    return apiResponse.successResponseWithData(res, "Success", assets);
  } catch (err) {
    return apiResponse.ErrorResponse(res, "Internal Server Error");
  }
};

const getUsersAssets = async (req, res, next) => {
  try {
    const data = await getUsersAssetsValidator.validateAsync(req.body);
    const assets = await Asset.find({ ownerId: data.ownerId });
    return apiResponse.successResponseWithData(res, "Success", assets);
  } catch (err) {
    console.log(err);
    return handlerError(res, err);
  }
};

const getAssetById = async (req,res,next) => {
  try{
    const data = await getAssetByIdValidator.validateAsync(req.body);
    const asset = await Asset.findById(data.assetId);
    return apiResponse.successResponseWithData(res,"Success",asset);
  }catch(err){
      console.log(err);
      return handlerError(res,err);
  }
}

module.exports = {
  createAsset,
  getAllAssets,
  getUsersAssets,
  updateAsset,
  deleteAsset,
  getAssetById,
};
