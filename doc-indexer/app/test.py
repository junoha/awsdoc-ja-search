import json
import jsonlines

import lxml
from lxml.html.clean import clean_html

json_list = []

with open("./all.jsonl", "r") as jsonl_file:
    json_list = list(jsonl_file)

# json_list = json_list[0:100]

index_list = []

for j in json_list:

    try:

        data = json.loads(j)
        url = data["url"]

        if "/ja_jp/" not in url.lower():
            print("no ja-jp")
            continue
        if data["status"] != 200:
            print("no 200")
            continue
        if "apireference" in url.lower():
            continue
        if "/cli/" in url.lower():
            continue

        print(url)

        h = lxml.html.fromstring(data["html"])
        title = h.cssselect("title")[0].text
        # print(title)

        product = None
        guide = None
        try:
            for meta in h.cssselect("meta"):
                if meta.get("name") == "product":
                    product = meta.get("content")
                if meta.get("name") == "guide":
                    guide = meta.get("content")
        except Exception:
            pass

        content = clean_html(h).text_content()  # .replace("\n"," ")
        content = "".join([line.strip() for line in content.splitlines()])

        index_list.append(
            {
                "objectID": url,
                "url": url,
                "guide": guide,
                "product": product,
                "title": title,
                "content": content,
            }
        )

    except Exception as e:
        print(j)
        print(e)

with jsonlines.open("./all-index.jsonl", mode="w") as f:
    f.write_all(index_list)
