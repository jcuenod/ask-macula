import os
from requests import post

API_BASE = os.environ.get("PROVIDER_URL")
MODEL = os.environ.get("MODEL")
API_KEY = os.environ.get("API_KEY")


# we're going to use requests instead of cerebras
def get_llm_response(
    messages: list,
    provider_url: str = API_BASE,
    model: str = MODEL,
    api_key: str = API_KEY,
    stream: bool = False,
    temperature: float = 0.7,
    max_tokens: int = 64000,
):
    """
    Get a response from the LLM using the OpenRouter API.
    """
    url = f"{provider_url}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    data = {
        "model": model,
        "messages": messages,
        "stream": stream,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    response = post(url, headers=headers, json=data)
    r = response.json()
    print(r)
    return r


sql_system_prompt = """
Here are the first few lines of a tsv file (19mb). The file is macula Greek tagging for the new testament.

```
macula_id	ref	role	part_of_speech	type	english	mandarin	gloss	text	after	lemma	normalized	strong	morph	person	number	gender	case	tense	voice	mood	degree	domain	ln	frame	subjref	referent
n40001001001	MAT 1:1!1		noun	common	book	谱	[The] book	Βίβλος	 	βίβλος	Βίβλος	976	N-NSF		singular	feminine	nominative					033005	33.38			
n40001001002	MAT 1:1!2		noun	common	genealogy	族	of [the] genealogy	γενέσεως	 	γένεσις	γενέσεως	1078	N-GSF		singular	feminine	genitive					010002 033003	10.24 33.19			
n40001001003	MAT 1:1!3		noun	proper	Jesus	耶稣	of Jesus	Ἰησοῦ	 	Ἰησοῦς	Ἰησοῦ	2424	N-GSM		singular	masculine	genitive					093001	93.169a			
n40001001004	MAT 1:1!4		noun	proper	Christ	基督	Christ	χριστοῦ	 	Χριστός	χριστοῦ	5547	N-GSM		singular	masculine	genitive					093001	93.387			
n40001001005	MAT 1:1!5		noun	common	son	子孙	son	υἱοῦ	 	υἱός	υἱοῦ	5207	N-GSM		singular	masculine	genitive					010002	10.30			
n40001001006	MAT 1:1!6		noun	proper	David	大卫	of David	Δαυὶδ	 	Δαυίδ	Δαυὶδ	1138	N-PRI		singular	masculine	genitive					093001	93.91			
n40001001007	MAT 1:1!7		noun	common	son	后裔	son	υἱοῦ	 	υἱός	υἱοῦ	5207	N-GSM		singular	masculine	genitive					010002	10.30			
n40001001008	MAT 1:1!8		noun	proper	Abraham	亚伯拉罕	of Abraham	Ἀβραάμ	.	Ἀβραάμ	Ἀβραάμ	11	N-PRI		singular	masculine	genitive					093001	93.7			
n40001002001	MAT 1:2!1	s	noun	proper	Abraham	亚伯拉罕	Abraham	Ἀβραὰμ	 	Ἀβραάμ	Ἀβραὰμ	11	N-PRI		singular	masculine	nominative					093001	93.7			
n40001002002	MAT 1:2!2	v	verb		fathered	生	begat	ἐγέννησεν	 	γεννάω	ἐγέννησεν	1080	V-AAI-3S	third	singular			aorist	active	indicative		023003	23.58	A0:n40001002001 A1:n40001002004		
n40001002003	MAT 1:2!3		det				-	τὸν	 	ὁ	τὸν	3588	T-ASM		singular	masculine	accusative					092004	92.24			
n40001002004	MAT 1:2!4		noun	proper	Isaac	以撒	Isaac	Ἰσαάκ	,	Ἰσαάκ	Ἰσαάκ	2464	N-PRI		singular	masculine	accusative					093001	93.180			
n40001002005	MAT 1:2!5	s	noun	proper	Isaac	以撒	Isaac	Ἰσαὰκ	 	Ἰσαάκ	Ἰσαὰκ	2464	N-PRI		singular	masculine	nominative					093001	93.180			
n40001002006	MAT 1:2!6		conj		and	又	then	δὲ	 	δέ	δὲ	1161	CONJ									089015	89.87			
n40001002007	MAT 1:2!7	v	verb		fathered	生	begat	ἐγέννησεν	 	γεννάω	ἐγέννησεν	1080	V-AAI-3S	third	singular			aorist	active	indicative		023003	23.58	A0:n40001002005 A1:n40001002009		
n40001002008	MAT 1:2!8		det				-	τὸν	 	ὁ	τὸν	3588	T-ASM		singular	masculine	accusative					092004	92.24			
n40001002009	MAT 1:2!9		noun	proper	Jacob	雅各	Jacob	Ἰακώβ	,	Ἰακώβ	Ἰακώβ	2384	N-PRI		singular	masculine	accusative					093001	93.157a			
n40001002010	MAT 1:2!10	s	noun	proper	Jacob	雅各	Jacob	Ἰακὼβ	 	Ἰακώβ	Ἰακὼβ	2384	N-PRI		singular	masculine	nominative					093001	93.157a			
n40001002011	MAT 1:2!11		conj		and	又	then	δὲ	 	δέ	δὲ	1161	CONJ									089015	89.87			
n40001002012	MAT 1:2!12	v	verb		fathered	生	begat	ἐγέννησεν	 	γεννάω	ἐγέννησεν	1080	V-AAI-3S	third	singular			aorist	active	indicative		023003	23.58	A0:n40001002010 A1:n40001002014;n40001002017		
```

I have imported it into duckdb. Note that ref is like `MAT 1:2!7` where the first 3 chars are the (usfm) book name then the chapter/verse reference follows (1:2) and finally the "!7" marks the word or "word-part" in the verse.

**Note**: The `role` column refers to the grammatical function of the word. The `lemma` column is the base form of the word, and the `text` column is the actual word in the text. So the `lemma` column is one of the most useful columns to consider when analyzing the data. The `normalized` column is a normalized form of the lemma, which can be useful for analysis. The `strong` column is a reference to the Strong's number for the lemma.

USFM Book Names:

1 MAT
2 MRK
3 LUK
4 JHN
5 ACT
6 ROM
7 1CO
8 2CO
9 GAL
10 EPH
11 PHP
12 COL
13 1TH
14 2TH
15 1TI
16 2TI
17 TIT
18 PHM
19 HEB
20 JAS
21 1PE
22 2PE
23 1JN
24 2JN
25 3JN
26 JUD
27 REV

# Examples

This query answers how many of each part of speech occur in each chapter of each book of the NT.

```
select split_part(ref, ':', 1) as reference, part_of_speech, count(part_of_speech) from macula where group by reference, part_of_speech order by reference;
```

# Instructions

Respond to the user with sql required to answers the question. Carefully think through the question before answering. Write only your answer in a ```sql ... ``` fence. Never write additional commentary.

Unless told otherwise, it is preferable to order your results by "macula_id" (the canonical order), but unless specifically asked you probably shouldn't return this column. If you group results by book, chapter, or verse, order your results **canonically** (not numerically) unless told otherwise.

Many queries will require you to consider the lemma or a gloss. Think carefully about which to use. Do not make up lemmas that are not provided by the user or the system. Never use strongs numbers that are not provided by the user or the system. For lemmas that are not provided by the user, you can use nested queries or CTEs to get the relevant lemma (or lemmas).

When using aggregate functions, provide appropriate alias names for the columns.
"""

js_system_prompt = """
Your task is choose an appropriate way to visualize results of a sql query using 'echarts-for-react'.

You will be provided with the user's query for context and a SQL query that answers it (and indicates the shape of the results, which will be a list of objects the keys corresponding to the columns returned).

Write the **body** of a javascript function that will produce a `ReactECharts` options object that will display the results of the SQL query in a way that is appropriate for the data. The data from the sql query will be passed into the function as the first and only parameter. In the client, it will be called like this:

```javascript
const fun = new Function('results', yourFunctionBody)
const echartsObject = fun(queryResults)
```

This means that you should not include the function signature or any imports in your code. You should also not include any `console.log` statements or other debugging code. The function should return the echarts options object. It can be like (remember to wrap it in a ```javascript ... ``` code fence):

```javascript
const data = results.map((result) => { /* code to process results */ })
const echartsOptions = {
    title: {
        text: 'Your Title',
    },
    // code to map results to echarts options
}
return echartsOptions
```

Note that `return` is used because the function is called with `new Function(...)` in the client code. Your function should return the echarts options object. Carefully consider the nature of the user's question to determine how best results should be visualized. If the most appopriate display of the data is simply to tabulate the results of the sql query, you should leave the code fence empty and return an empty string. But it would be ideal to chart the results in some way (the tabulated results will be available irrespective). Remember that your code needs to work in the `Function` constructor! Do not write any additional commentary or explanation.
"""


def get_code_fence_from_response(response: str, code_kind: str) -> str:
    """
    This function extracts the SQL query from the response string.
    It assumes the SQL query is enclosed in triple backticks (```).
    """
    # Find the start and end of the code block
    code_start = response.find(f"```{code_kind}") + len(f"```{code_kind}")
    code_end = response.find("```", code_start)

    code_block = response[code_start:code_end].strip()

    if not code_block:
        raise ValueError("No code query found in the response.")

    return code_block


def get_sql_query(user_query: str) -> str:
    """
    This function generates a SQL query to find the most common nouns in the Pauline Epistles.
    It uses the Cerebras API to get the SQL query based on the provided system prompt.
    """
    response = get_llm_response(
        messages=[
            {"role": "system", "content": sql_system_prompt},
            {"role": "user", "content": user_query},
        ],
    )

    response = response["choices"][0]["message"]["content"]
    return get_code_fence_from_response(response, "sql")


def get_js_code(user_query: str, sql_query: str) -> str:
    """
    This function generates a SQL query to find the most common nouns in the Pauline Epistles.
    It uses the Cerebras API to get the SQL query based on the provided system prompt.
    """
    query = f"User query: {user_query}\n\nSQL:\n\n```sql\n{sql_query}\n```"

    response = get_llm_response(
        messages=[
            {"role": "system", "content": js_system_prompt},
            {"role": "user", "content": query},
        ],
    )

    response = response["choices"][0]["message"]["content"]

    return get_code_fence_from_response(response, "javascript")
