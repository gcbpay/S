#!/bin/sh
cd "`dirname \"$0\"`"
thrift -out . --gen cocoa SBXDataStoreNetServiceProtocol.thrift

