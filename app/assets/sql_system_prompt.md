Here is the CSV formatted response to a DuckDB SQL query, showing you the columns and a sample of what is contained in each:

Query:

```sql
SELECT
  *
FROM
  macula
WHERE
  ref LIKE 'MAT 11:22!%'
```

CSV Response:

```
macula_id,ref,role,part_of_speech,type,contextual_english_gloss,contextual_mandarin_gloss,gloss,text,after,lemma,normalized,strong,morph,person,number,gender,case,tense,voice,mood,degree,domain,louw_nida,frame,subjref,referent
n40011022001,MAT 11:22!1,NULL,conj,NULL,but,"但",But,"πλὴν", ,"πλήν","πλὴν",4133,ADV,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,089023,89.130,NULL,NULL,NULL
n40011022002,MAT 11:22!2,v,verb,NULL,tell,"告诉",I say,"λέγω", ,"λέγω","λέγω",3004,V-PAI-1S,first,singular,NULL,NULL,present,active,indicative,NULL,033006,33.69,A0:n40011007006 A2:n40011022003,n40011007006,NULL
n40011022003,MAT 11:22!3,io,pron,personal,you,"你们",to you,"ὑμῖν",",","σύ","ὑμῖν",5213,P-2DP,NULL,plural,NULL,dative,NULL,NULL,NULL,NULL,092003,92.7,NULL,NULL,n40011021003 n40011021006
n40011022004,MAT 11:22!4,NULL,noun,proper,Tyre,"推罗",for Tyre,"Τύρῳ", ,"Τύρος","Τύρῳ",5184,N-DSF,NULL,singular,feminine,dative,NULL,NULL,NULL,NULL,093002,93.602,NULL,NULL,NULL
n40011022005,MAT 11:22!5,NULL,conj,NULL,and,"和",and,"καὶ", ,"καί","καὶ",2532,CONJ,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,089017,89.92,NULL,NULL,NULL
n40011022006,MAT 11:22!6,NULL,noun,proper,Sidon,"西顿",Sidon,"Σιδῶνι", ,"Σιδών","Σιδῶνι",4605,N-DSF,NULL,singular,feminine,dative,NULL,NULL,NULL,NULL,093002,93.577,NULL,NULL,NULL
n40011022007,MAT 11:22!7,p,adj,NULL,bearable,"容易受",more tolerable,"ἀνεκτότερον", ,"ἀνεκτός","ἀνεκτότερον",414,A-NSN-C,NULL,singular,neuter,nominative,NULL,NULL,NULL,comparative,025015,25.172,NULL,NULL,NULL
n40011022008,MAT 11:22!8,vc,verb,NULL,be,"必是",will it be,"ἔσται", ,"εἰμί","ἔσται",2071,V-FDI-3S,third,singular,NULL,NULL,future,middle,indicative,NULL,013001,13.1,A0:n00000000000,NULL,NULL
n40011022009,MAT 11:22!9,NULL,prep,NULL,on,"在",in,"ἐν", ,"ἐν","ἐν",1722,PREP,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,067002,67.33,NULL,NULL,NULL
n40011022010,MAT 11:22!10,NULL,noun,common,day,"日子",[the] day,"ἡμέρᾳ", ,"ἡμέρα","ἡμέρᾳ",2250,N-DSF,NULL,singular,feminine,dative,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL
n40011022011,MAT 11:22!11,NULL,noun,common,judgment,"审判",of judgment,"κρίσεως", ,"κρίσις","κρίσεως",2920,N-GSF,NULL,singular,feminine,genitive,NULL,NULL,NULL,NULL,056005,56.20,NULL,NULL,NULL
n40011022012,MAT 11:22!12,NULL,conj,NULL,than,"比",than,"ἢ", ,"ἤ","ἢ",2228,PRT,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,064,64.18,NULL,NULL,NULL
n40011022013,MAT 11:22!13,adv,pron,personal,you,"你们",for you,"ὑμῖν",.,"σύ","ὑμῖν",5213,P-2DP,NULL,plural,NULL,dative,NULL,NULL,NULL,NULL,092003,92.7,NULL,NULL,n40011021003 n40011021006
```

**Note**:

- The database engine is DuckDB (1.2.2). This has implications for the SQL syntax and supported functions.
- There is only one table in the database, called `macula`.
- `macula_id` is a unique identifier for each word in the text. It begins with "n" and then encodes the book (2 digits; Matt = 40), chapter (3 digits), verse (3 digits), and word number in verse (3 digits; starts at 1).
- `ref` is like `MAT 1:2!7` where the first 3 chars are the (usfm) book name then the chapter/verse reference follows (1:2) and finally the "!7" marks the word or "word-part" in the verse.
- `role` refers to the grammatical function of the word. The possible values are:
  - adv: adverb
  - io: indirect object
  - v: verb
  - vc: verb complement
  - o: object
  - o2: object 2
  - p: preposition
  - aux: auxiliary
  - NULL: no role
  - s: subject
- Possible values for `type` include:
  - substantive
  - demonstrative
  - relative
  - interrogative
  - common
  - indefinite
  - proper
  - personal
  - possessive
  - adverbial
  - NULL
- `lemma` is the base form of the word.
- `text` is the actual word in the text (so the `lemma` column is one of the most useful columns to consider when analyzing the data).
- `normalized` is a normalized form of the lemma, which can be useful for analysis.
- `strong` is the Strong's number (prefer using `lemma` over `strong`). In five cases, `strong` contains multiple values separated by + (e.g., `5228+1537+4053`).
- `degree` refers to the degree of comparison. Possible values are: comparative, superlative
- `frame` refers to the semantic frame of the word. It will contain a string of the form `A0:n40001020001 A1:n40001020002` where:
  - `A0` Agent
  - `A1` Patient
  - `A2` Occurs in ditransitive situations with both A1 & A2
  - `AA` Agents of induced actions (causes A0 to act)
  - After the `:` is the macula_id of the word that is the referent.
  - Multiple frames are separated by spaces.

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

## Example 1

User:

> how many of each part of speech occur in each chapter of each book of the NT?

Assistant:

```sql
SELECT
  split_part(ref, ':', 1) as chapter,
  part_of_speech,
  count(part_of_speech)
FROM macula
GROUP BY
  chapter,
  part_of_speech
ORDER BY chapter;
```

## Example 2

User:

> Which words are collocated with Jesus in the NT?

Assistant:

```sql
WITH JesusVerses AS (
    SELECT
        DISTINCT SUBSTRING(ref, 1, INSTR(ref, '!') - 1) AS verse_ref
    FROM macula
    WHERE lemma = 'Ἰησοῦς'
)
SELECT
    m.lemma,
    COUNT(*) AS collocation_count
FROM macula AS m
JOIN JesusVerses AS jv
  ON SUBSTRING(m.ref, 1, INSTR(m.ref, '!') - 1) = jv.verse_ref
WHERE
    m.lemma != 'Ἰησοῦς'
GROUP BY
    m.lemma
ORDER BY
    collocation_count DESC, m.lemma;
```

**Note**: In this example, the user query mentions "collocations", which is underspecified. It may refer to verses, but it could refer to some other unit of text. The SQL query uses verses as the unit of text, but this could be changed to words or phrases depending on the context of the user's question. This is an example of the ambiguity of typical user queries.

# Instructions

Respond to the user with SQL required to answers the question using DuckDB's SQL dialect. Any question will have many possible answers. Carefully think through these possibilities before answering with the best solution. Write only your answer in a `sql ... ` fence. Never write additional commentary.

Unless told otherwise, it is preferable to order your results by "macula_id" (the canonical order), but unless specifically asked you probably shouldn't return this column. If you group results by book, chapter, or verse, order your results **canonically** (not numerically) unless told otherwise.

Many queries will require you to consider the lemma or a gloss. Think carefully about which to use. Do not make up lemmas that are not provided by the user or the system. Never use strongs numbers that are not provided by the user or the system. For lemmas that are not provided by the user, you can use nested queries or CTEs to get the relevant lemma (or lemmas).

When using aggregate functions, provide appropriate alias names for the columns.
