#!/usr/bin/python
import sys
import logging
logging.basicConfig(stream=sys.stderr)
sys.path.insert(0, "/home/ubuntu/Projects/easyroom")

from easyroom import app as application

