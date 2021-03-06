"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = parseFilename;

var _toArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toArray"));

function parseFilename(filename) {
  if (!filename) {
    return {
      extname: '',
      name: ''
    };
  } else if (~filename.indexOf('.')) {
    var _filename$split$rever = filename.split('.').reverse(),
        _filename$split$rever2 = (0, _toArray2["default"])(_filename$split$rever),
        extensionWithoutDot = _filename$split$rever2[0],
        nameSegments = _filename$split$rever2.slice(1);

    return {
      extname: '.' + extensionWithoutDot,
      name: nameSegments.reverse().join('.')
    };
  } else {
    return {
      extname: '',
      name: filename
    };
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wYXJzZUZpbGVuYW1lLmpzIl0sIm5hbWVzIjpbInBhcnNlRmlsZW5hbWUiLCJmaWxlbmFtZSIsImV4dG5hbWUiLCJuYW1lIiwiaW5kZXhPZiIsInNwbGl0IiwicmV2ZXJzZSIsImV4dGVuc2lvbldpdGhvdXREb3QiLCJuYW1lU2VnbWVudHMiLCJqb2luIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFlLFNBQVNBLGFBQVQsQ0FBdUJDLFFBQXZCLEVBQWlDO0FBQzVDLE1BQUksQ0FBQ0EsUUFBTCxFQUFlO0FBQ1gsV0FBTztBQUNIQyxNQUFBQSxPQUFPLEVBQUUsRUFETjtBQUVIQyxNQUFBQSxJQUFJLEVBQUU7QUFGSCxLQUFQO0FBSUgsR0FMRCxNQUtPLElBQUksQ0FBQ0YsUUFBUSxDQUFDRyxPQUFULENBQWlCLEdBQWpCLENBQUwsRUFBNEI7QUFBQSxnQ0FDZ0JILFFBQVEsQ0FBQ0ksS0FBVCxDQUFlLEdBQWYsRUFBb0JDLE9BQXBCLEVBRGhCO0FBQUE7QUFBQSxRQUN4QkMsbUJBRHdCO0FBQUEsUUFDQUMsWUFEQTs7QUFHL0IsV0FBTztBQUNITixNQUFBQSxPQUFPLEVBQUUsTUFBTUssbUJBRFo7QUFFSEosTUFBQUEsSUFBSSxFQUFFSyxZQUFZLENBQUNGLE9BQWIsR0FBdUJHLElBQXZCLENBQTRCLEdBQTVCO0FBRkgsS0FBUDtBQUlILEdBUE0sTUFPQTtBQUNILFdBQU87QUFDSFAsTUFBQUEsT0FBTyxFQUFFLEVBRE47QUFFSEMsTUFBQUEsSUFBSSxFQUFFRjtBQUZILEtBQVA7QUFJSDtBQUNKIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VGaWxlbmFtZShmaWxlbmFtZSkge1xuICAgIGlmICghZmlsZW5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGV4dG5hbWU6ICcnLFxuICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKH5maWxlbmFtZS5pbmRleE9mKCcuJykpIHtcbiAgICAgICAgY29uc3QgW2V4dGVuc2lvbldpdGhvdXREb3QsIC4uLm5hbWVTZWdtZW50c10gPSBmaWxlbmFtZS5zcGxpdCgnLicpLnJldmVyc2UoKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXh0bmFtZTogJy4nICsgZXh0ZW5zaW9uV2l0aG91dERvdCxcbiAgICAgICAgICAgIG5hbWU6IG5hbWVTZWdtZW50cy5yZXZlcnNlKCkuam9pbignLicpXG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGV4dG5hbWU6ICcnLFxuICAgICAgICAgICAgbmFtZTogZmlsZW5hbWVcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=