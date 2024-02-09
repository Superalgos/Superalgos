# CMakeList.txt : CMake project for TradeAnalysis, include source and define
# project specific logic here.
#

# Add source to this project's executable.
add_executable (TradeAnalysis "TradeAnalysis.cpp" "TradeAnalysis.h" "SummaryLine.h"  "SummaryLine.cpp"   "Line.h" "Line.cpp")

if (CMAKE_VERSION VERSION_GREATER 3.12)
  set_property(TARGET TradeAnalysis PROPERTY CXX_STANDARD 20)
endif()

# TODO: Add tests and install targets if needed.
