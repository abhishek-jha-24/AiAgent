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

const Web3 = require('web3');
const abi=require('../build/contracts/assetContract').abi;
const address=require('../build/contracts/assetContract').address;
const HDWalletProvider = require('@truffle/hdwallet-provider');
const address1='0xccdb17b8eF68ffFdbCA4bf4AB6B765e41d61733A';
const privateKey1="c244b6e8ae351e71fa353515c55a4e0be82fb5bf7186c18419f89421805f74b7";

// const init = async() => {
//  const provider = new  HDWalletProvider(
//    privateKey1,
//    'https://ropsten.infura.io/v3/8d012749a8ae4ca1a238b25053109ffe'
//  );
//  const web3 = new Web3(provider);
//  const accounts= await web3.eth.getAccounts();
//  const contract = new web3.eth.Contract(abi,address);

//  //Sending transactions from parent account to secondary account
//  let parameters = {
//   from:address1,
//   to:0x391C924EC2dC3454CEc9C79d9f381ab43BF31aDc,
//   value:web3.utils.toWei('1','ether')
//  }
// var assetCreateReceipt=await contract.methods.assetCreate("lion","vivek","lion is the king of the jungle",1).send({from: address1});
// console.log(assetCreateReceipt);

// // var burnTokenReceipt=await contract.methods.burnToken(4).send({from: address1});
// // console.log(burnTokenReceipt);
//  };
// init();


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
    const init = async() => {
      const provider = new  HDWalletProvider(
        privateKey1,
        'https://ropsten.infura.io/v3/8d012749a8ae4ca1a238b25053109ffe'
      );
     const web3 = new Web3(provider);
      const accounts= await web3.eth.getAccounts();
      const contract = new web3.eth.Contract(abi,address);
     
      //Sending transactions from parent account to secondary account
      let parameters = {
       from:address1,
       to:0x391C924EC2dC3454CEc9C79d9f381ab43BF31aDc,
       value:web3.utils.toWei('1','ether')
      }
    //  var assetCreateReceipt=await contract.methods.assetCreate("lion","vivek","lion is the king of the jungle",8).send({from: address1});
    //  console.log(assetCreateReceipt);
     
     var burnTokenReceipt=await contract.methods.burnToken(3).send({from: address1});
     console.log(burnTokenReceipt);
      };
     init();
  
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

    const init = async() => {
      const provider = new  HDWalletProvider(
        privateKey1,
        'https://ropsten.infura.io/v3/8d012749a8ae4ca1a238b25053109ffe'
      );
     const web3 = new Web3(provider);
      const accounts= await web3.eth.getAccounts();
      const contract = new web3.eth.Contract(abi,address);
     
      //Sending transactions from parent account to secondary account
      let parameters = {
       from:address1,
       to:0x391C924EC2dC3454CEc9C79d9f381ab43BF31aDc,
       value:web3.utils.toWei('1','ether')
      }
    //  var assetCreateReceipt=await contract.methods.assetCreate("lion","vivek","lion is the king of the jungle",6).send({from: address1});
    //  console.log(assetCreateReceipt);
     
     var burnTokenReceipt=await contract.methods.burnToken(3).send({from: address1});
     console.log(burnTokenReceipt);
      };
     init();
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
    const init = async() => {
      const provider = new  HDWalletProvider(
        privateKey1,
        'https://ropsten.infura.io/v3/8d012749a8ae4ca1a238b25053109ffe'
      );
     const web3 = new Web3(provider);
      const accounts= await web3.eth.getAccounts();
      const contract = new web3.eth.Contract(abi,address);
     
      //Sending transactions from parent account to secondary account
      let parameters = {
       from:address1,
       to:0x391C924EC2dC3454CEc9C79d9f381ab43BF31aDc,
       value:web3.utils.toWei('1','ether')
      }
    //  var assetCreateReceipt=await contract.methods.assetCreate("lion","vivek","lion is the king of the jungle",1).send({from: address1});
    //  console.log(assetCreateReceipt);
     
     var burnTokenReceipt=await contract.methods.burnToken(3).send({from: address1});
     console.log(burnTokenReceipt);
      };
     init();
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
