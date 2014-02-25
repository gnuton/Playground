import urllib2
from xml.dom import minidom
import re
import time

class huuto:
	oldItemsFilePath = "oldids.dat"
	url_api="http://api.huuto.net/somt/0.9/categories/331/items/?page=%d"
	id_url="http://api.huuto.net/somt/0.9/items/"
        item_url="http://www.huuto.net/kohteet/item/"

        def getData(self, page):
                res = urllib2.urlopen(self.url_api % page)
                xml = res.read()
                return xml

        def getItems(self, page):
		print "Downloading page %d" % page
                xml = self.getData(page)
                xmldoc = minidom.parseString(xml)
                itemlist = xmldoc.getElementsByTagName('entry')
                return itemlist

        def getNewItemsForPage(self, page):
		itemList = []
                for item in self.getItems(page):
			i = dict() 
                        i["title"] = self.__getValue(item, "title")
                        i["time"] = self.__getValue(item, "updated")
			i["id"] = re.sub(self.id_url, '', self.__getValue(item, "id"))

			itemList.append(i)
		return itemList

	def getNewItems(self):
		itemlist = []
		page = 0
		while True:
			newItems = self.getNewItemsForPage(page)
			if not len(newItems):
				break
			itemlist.extend(newItems)
			page += 1
		return itemlist

	def showNewItems(self):
		res = list()

		# get new items
		newItems = self.getNewItems()
		print "Downloaded %d items" % len(newItems)
		# get old ones
		oldItemIDs = []
		try:
			with file(self.oldItemsFilePath, "r") as foldItemsFile:
				oldItemIDs = eval("".join(foldItemsFile.readlines()))
				foldItemsFile.close()
				print "Loaded %d old items" % len(oldItemIDs)
		except IOError as e:
			print "SKIP" 

		# print difference
	        newItemIDs = [x["id"] for x in newItems]	
		diff = list(set(newItemIDs) - set(oldItemIDs))
		#print "NEW ITEMS:" + repr(newItemIDs)
		#print "OLD ITEMS:" + repr(oldItemIDs)
		#print "DIFF:" + repr(diff)
		i = 0
		for item in diff:
			# get title
			title = None
			for x in newItems:
				if x["id"] == item:
					title = x["title"]
			print "%d\t%s%s\t %s" % (i, self.item_url, item, title)
			data = "%s(%s)\n" % (title, item)
			res.append(data)
			i+= 1

		# save new items to db
		with file(self.oldItemsFilePath, "w") as foldItemsFile:
			oldIDs = [x["id"] for x in newItems ]
			oldIDs = set(oldIDs)
			foldItemsFile.write(repr(oldIDs))
			foldItemsFile.close()

		return res

        def __getValue(self, mynode, val):
                res = None
                rv = mynode.getElementsByTagName(val)
                for v in rv:
                        var = v.childNodes[0].nodeValue
                        res = var
                return res

	def getNotifications(self):
		# import things we need to display allerts
		import pynotify
		if not pynotify.init("Urgency"):
			print "The script cannot display notifications, sorry!"
			return

		# never ending loop!
		while True:
			data = self.showNewItems()
			n = pynotify.Notification("New item added toHuuto.net" ,"".join(data))
			n.set_urgency(pynotify.URGENCY_CRITICAL)
			n.set_timeout(60000)
			if not n.show():
				print "Failed to send notification"
			time.sleep(60 * 10) # 10 mins

if __name__ == "__main__":
        h = huuto()
        #h.showNewItems()
	h.getNotifications()