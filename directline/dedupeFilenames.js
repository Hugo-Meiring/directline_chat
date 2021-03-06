"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = dedupeFilenames;

var _parseFilename2 = _interopRequireDefault(require("./parseFilename"));

function dedupeFilenames(array) {
  var nextArray = [];
  array.forEach(function (value) {
    var _parseFilename = (0, _parseFilename2["default"])(value),
        extname = _parseFilename.extname,
        name = _parseFilename.name;

    var count = 0;
    var nextValue = value;

    while (nextArray.includes(nextValue)) {
      nextValue = [name, "(".concat(++count, ")")].filter(function (segment) {
        return segment;
      }).join(' ') + extname;
    }

    nextArray.push(nextValue);
  });
  return nextArray;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWR1cGVGaWxlbmFtZXMudHMiXSwibmFtZXMiOlsiZGVkdXBlRmlsZW5hbWVzIiwiYXJyYXkiLCJuZXh0QXJyYXkiLCJmb3JFYWNoIiwidmFsdWUiLCJleHRuYW1lIiwibmFtZSIsImNvdW50IiwibmV4dFZhbHVlIiwiaW5jbHVkZXMiLCJmaWx0ZXIiLCJzZWdtZW50Iiwiam9pbiIsInB1c2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBOztBQUVlLFNBQVNBLGVBQVQsQ0FBeUJDLEtBQXpCLEVBQTBDO0FBQ3JELE1BQU1DLFNBQW1CLEdBQUcsRUFBNUI7QUFFQUQsRUFBQUEsS0FBSyxDQUFDRSxPQUFOLENBQWMsVUFBQUMsS0FBSyxFQUFJO0FBQUEseUJBQ08sZ0NBQWNBLEtBQWQsQ0FEUDtBQUFBLFFBQ1hDLE9BRFcsa0JBQ1hBLE9BRFc7QUFBQSxRQUNGQyxJQURFLGtCQUNGQSxJQURFOztBQUVuQixRQUFJQyxLQUFLLEdBQUcsQ0FBWjtBQUNBLFFBQUlDLFNBQVMsR0FBR0osS0FBaEI7O0FBRUEsV0FBT0YsU0FBUyxDQUFDTyxRQUFWLENBQW1CRCxTQUFuQixDQUFQLEVBQXNDO0FBQ2xDQSxNQUFBQSxTQUFTLEdBQUcsQ0FBQ0YsSUFBRCxhQUFhLEVBQUVDLEtBQWYsUUFBMkJHLE1BQTNCLENBQWtDLFVBQUFDLE9BQU87QUFBQSxlQUFJQSxPQUFKO0FBQUEsT0FBekMsRUFBc0RDLElBQXRELENBQTJELEdBQTNELElBQWtFUCxPQUE5RTtBQUNIOztBQUVESCxJQUFBQSxTQUFTLENBQUNXLElBQVYsQ0FBZUwsU0FBZjtBQUNILEdBVkQ7QUFZQSxTQUFPTixTQUFQO0FBQ0giLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGFyc2VGaWxlbmFtZSBmcm9tICcuL3BhcnNlRmlsZW5hbWUnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZWR1cGVGaWxlbmFtZXMoYXJyYXk6IHN0cmluZ1tdKSB7XG4gICAgY29uc3QgbmV4dEFycmF5OiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgYXJyYXkuZm9yRWFjaCh2YWx1ZSA9PiB7XG4gICAgICAgIGNvbnN0IHsgZXh0bmFtZSwgbmFtZSB9ID0gcGFyc2VGaWxlbmFtZSh2YWx1ZSk7XG4gICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgIGxldCBuZXh0VmFsdWUgPSB2YWx1ZTtcblxuICAgICAgICB3aGlsZSAobmV4dEFycmF5LmluY2x1ZGVzKG5leHRWYWx1ZSkpIHtcbiAgICAgICAgICAgIG5leHRWYWx1ZSA9IFtuYW1lLCBgKCR7ICgrK2NvdW50KSB9KWBdLmZpbHRlcihzZWdtZW50ID0+IHNlZ21lbnQpLmpvaW4oJyAnKSArIGV4dG5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBuZXh0QXJyYXkucHVzaChuZXh0VmFsdWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5leHRBcnJheTtcbn1cbiJdfQ==