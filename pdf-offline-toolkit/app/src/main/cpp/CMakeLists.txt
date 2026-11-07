cmake_minimum_required(VERSION 3.22.1)

project("ledger_pdf" VERSION 1.0.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_library(log-lib log)
find_library(jnigraphics-lib jnigraphics)

add_library(
    ledger_pdf
    SHARED
    ledger_pdf_jni.cpp
)

target_include_directories(
    ledger_pdf
    PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
)

target_link_libraries(
    ledger_pdf
    ${log-lib}
    ${jnigraphics-lib}
)
