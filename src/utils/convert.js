const getFavUnitIndex = (attribute) => {
  if (attribute.unit[attribute.favUnitIdx]) 
    return attribute.favUnitIdx
  return getBaseUnitIndex(attribute)
}

const getBaseUnitIndex = (attribute) => {
  if (
    !isNaN(attribute.baseUnitIdx)
    && attribute.unit[attribute.baseUnitIdx]
    && attribute.unit[attribute.baseUnitIdx].isBaseUnit
  ) return attribute.baseUnitIdx

  const base = attribute.unit.filter(unit => unit.isBaseUnit === 1)
  return (base.length !== 1) ? 0 : attribute.unit.map((unit) => unit.unitName).indexOf(base[0].unitName)
}

const getFavUnit = (attribute) => attribute.unit[getFavUnitIndex(attribute)]

const getBaseUnit = (attribute) => attribute.unit[getBaseUnitIndex(attribute)]

const reduce = (numerator,denominator) => {
    var gcd = function gcd(a,b){
      return b ? gcd(b, a%b) : a;
    };
    gcd = gcd(numerator,denominator);
    return [numerator/gcd, denominator/gcd];
}

const getNearest = (value) => {
    var sum = 1, val = [];
    for(var i=1; i< 12; i++){
        sum = sum + sum,
        val.push(sum)
    }
    var fraction=val[0];
    for(var k=0; k< val.length; k++){
        if(Math.abs(value - val[k]) < Math.abs(value - fraction)){
            fraction = val[k]
        }
    }
    return fraction
}

const isEmptyOrWhiteSpace = (str) => (str === null || str.match(/^\s*$/) !== null)

const convertToFav = (attribute, currentValue, decimals=null) => {
  const favUnit = getFavUnit(attribute)
  const decimal = (decimals === null) ? favUnit.decimals : decimals
  const units = attribute.unit
  if (currentValue === undefined || isEmptyOrWhiteSpace(currentValue)) return ''
  

  var getUnit = currentValue.split(/(^\-?\d+\.?\d*|\.\d+)/g); //split the value

  var getStatic = currentValue.split(' '); //if no units are passed
  // console.log(getUnit)

  var unitFactor = {};
  if(getUnit.length > 1 && !isEmptyOrWhiteSpace(getUnit[2])){
    for(var i=0;i < units.length; i++){
      // var checkInch = getUnit[2].match(/((^"$)|(["](\d*)\/?\d*))/g);
      var checkInch = getUnit[2].match(/((^")|([1-9]*[0-9]*\/*[1-9][0-9]*["]*))/g);
      //console.log(getStatic,units[i].unitStr);
      if(getStatic[1] === units[i].unitStr.toLowerCase()){
        unitFactor = units[i];
      }
      // console.log(checkInch);

      //if the value is in inch and fav is not inch
      if(checkInch !== null && checkInch[0] !== '"' && checkInch[0] === getUnit[2].replace(' ','') && favUnit.unitStr !== 'inch'){
        //console.log('insde*****');
        var convertToDecimal = '';
       // console.log(getUnit,'check');
        convertToDecimal =(getUnit[2]).split('"')
        //console.log(convertToDecimal,'***');
        convertToDecimal = convertToDecimal[0].split('/');

        if(getUnit.length > 3){
          convertToDecimal =(getUnit[2] + getUnit[3] + getUnit[4] ).split('"');
          convertToDecimal = convertToDecimal[1].split('/');
        }
        //console.log(convertToDecimal,'***');
        var decimalVal=0;
        if(convertToDecimal[1] !== ''){
          decimalVal = (eval(convertToDecimal[0]/convertToDecimal[1]));
          inchFlag = 1;
        }
        //console.log(decimalVal,'***');
        getUnit[1] =eval(parseInt(getUnit[1]) + parseFloat(decimalVal));
      }
      //console.log(getUnit,'/////');

      if((getUnit[2].replace(' ','')) === units[i].unitStr || ( checkInch !== null && checkInch[0] === getUnit[2].replace(' ','')  && favUnit.unitStr === units[i].unitStr) && inchFlag === 1 ){
        flag = 1;
        //console.log(getUnit,units[i], 'check/*/*/*');
        if(favUnit.unitStr === 'inch'){
          var inchValue = (((parseFloat(getUnit[1])/units[i].unitFactor)*favUnit.unitFactor)+favUnit.offset).toFixed(decimal);
          //console.log(inchValue,'check*-*-*-');
          var breakInch = inchValue.split('.');
          var fractionValue = getNearest(breakInch[1]);
          var getReduced = reduce(parseInt(Math.ceil((parseFloat(0 + '.' + breakInch[1]))*fractionValue)), fractionValue);
          // console.log((parseFloat(breakInch[1]))*fractionValue,'in');
          if(checkInch !== null && checkInch[0].indexOf('"') !== -1){
            convertedValue = currentValue;
          }
          else{
            convertedValue = breakInch[0] + ' ' + getReduced[0] + '/' + getReduced[1]+'"';
          }

        }
        else{
          //console.log(parseFloat(getUnit[1]),units[i],units[i].unitFactor,favUnit.unitFactor,'check');
          //console.log('insnide');
          var currentUnitFactor = units[i].unitFactor;
          //console.log(checkInch);

          //if current unit is inch and needs to convert
          if(checkInch !== null && checkInch[0].indexOf('"') !== -1){
            currentUnitFactor =  0.03937085375696372;
          }
          //console.log(getUnit[1],(((parseFloat(getUnit[1])/currentUnitFactor)*favUnit.unitFactor)+favUnit.offset).toFixed(decimal),'in');
          convertedValue = (((parseFloat(getUnit[1])/currentUnitFactor)*favUnit.unitFactor)+favUnit.offset).toFixed(decimal) + ' ' + favUnit.unitStr;
        }

        //console.log(convertedValue);
      }
    }

  //if no match found with available unit

    if(flag === 0){
      if(favUnit.unitStr === 'inch'){
        var breakDecimal = (getUnit[2].replace(' ','')).replace('"','').split('/');
        //console.log(breakDecimal);
        if(breakDecimal.length > 0 && breakDecimal[0] !== ''){
          var getReduced = reduce(parseInt(breakDecimal[0]), parseInt(breakDecimal[1]));
          convertedValue = getUnit[1]+ ' '+ getReduced[0]+ '/' + getReduced[1]+'"';
        }
        else{
          var convertedValue = (getUnit[1]);
          var currentUnit = unitFactor.unitFactor !== undefined? unitFactor.unitFactor : 1;
          var currentUnitOffset = unitFactor.offset !== undefined? unitFactor.offset : 0;
          var sign = 0;
          //console.log(unitFactor,favUnit,'*****');
          //if offset is availble and convert to base unit so subtract offset
          if(unitFactor.offest > favUnit.offset && unitFactor.offset !== undefined){
            //console.log(sign,'/*/*/*');
            sign = -1 *unitFactor.offset;
            convertedValue = ((((parseFloat(getUnit[1])  + (sign) )/currentUnit) * favUnit.unitFactor )).toFixed(decimal);
          }
          else{
            sign = 1 * favUnit.offset;
            convertedValue = ((((parseFloat(getUnit[1]) - currentUnitOffset )/currentUnit) * favUnit.unitFactor ) + (sign) ).toFixed(decimal);
          }
          //console.log(convertedValue);
          var breakInch = convertedValue.split('.');
          //console.log(breakInch);
          var fractionValue = getNearest(breakInch[1]);
          //console.log(fractionValue,'check');
          var getReduced = reduce(parseInt(Math.ceil((parseFloat(0 + '.' + breakInch[1]))*fractionValue)), fractionValue);
          //console.log(getReduced,'check**');
          convertedValue = breakInch[0] + ' ' + getReduced[0] + '/' + getReduced[1]+'"';
        }
      }
      else{
        var currentUnit = unitFactor.unitFactor !== undefined? unitFactor.unitFactor : 1;
        var currentUnitOffset = unitFactor.offset !== undefined? unitFactor.offset : 0;
        var sign = 0;
        //console.log(unitFactor,favUnit,'*****');
        //if offset is availble and convert to base unit so subtract offset
        if(unitFactor.offest > favUnit.offset && unitFactor.offset !== undefined){
          //console.log(sign,'/*/*/*');
          sign = -1 *unitFactor.offset;
          convertedValue = ((((parseFloat(getUnit[1])  + (sign) )/currentUnit) * favUnit.unitFactor )).toFixed(decimal) + ' ' + favUnit.unitStr;
        }
        else{
          sign = 1 * favUnit.offset;
          convertedValue = ((((parseFloat(getUnit[1]) - currentUnitOffset )/currentUnit) * favUnit.unitFactor ) + (sign) ).toFixed(decimal) + ' ' + favUnit.unitStr;
        }
        //console.log(convertedValue,'in1');
      }
    }
  }
  else{
    // var favBase = getFav(units);
    // var favUnitBase = state.attrMapAttrId[currentType][favBase];
    if(favUnit.unitStr === 'inch'){
      convertedValue = 0 + '"';
    }
    else{
      convertedValue = parseFloat(0).toFixed(decimal) + ' ' + favUnit.unitStr;
    }
  }
  //console.log(convertedValue,'in2');
  //state = {...state,
  //  attrValue: convertedValue
  //}
  return convertedValue;
}
export default convertToFav
export { getFavUnit, getBaseUnit, getFavUnitIndex }
