import { useState, useRef, useEffect } from "react";

// ─── Embedded data ────────────────────────────────────────────────────────────
const DB = {"source":{"SALES_REP":{"columns":["REP_ID","REP_NM","REP_EMAIL","REGION_CD"],"types":{"REP_ID":"INTEGER","REP_NM":"TEXT","REP_EMAIL":"TEXT","REGION_CD":"TEXT"},"rows":[{"REP_ID":1,"REP_NM":"Sandra Lee","REP_EMAIL":"sandra.lee@company.com","REGION_CD":"MIDWEST"},{"REP_ID":2,"REP_NM":"Tom Garcia","REP_EMAIL":"tom.garcia@company.com","REGION_CD":"SOUTH"},{"REP_ID":3,"REP_NM":"Nina Patel","REP_EMAIL":"nina.patel@company.com","REGION_CD":"WEST"}]},"CUST_MASTER":{"columns":["CUST_ID","CUST_NM","CUST_EMAIL","CUST_PH","ADDR_LINE1","ADDR_LINE2","CITY_NM","ST_CD","ZIP_CD","CTRY_CD","CUST_TYP","CRDT_LMT","ACCT_STAT","CREAT_DT","UPD_DT","SALES_REP_ID","LEGACY_CODE"],"types":{"CUST_ID":"INTEGER","CUST_NM":"TEXT","CUST_EMAIL":"TEXT","CUST_PH":"TEXT","ADDR_LINE1":"TEXT","ADDR_LINE2":"TEXT","CITY_NM":"TEXT","ST_CD":"TEXT","ZIP_CD":"TEXT","CTRY_CD":"TEXT","CUST_TYP":"TEXT","CRDT_LMT":"REAL","ACCT_STAT":"TEXT","CREAT_DT":"TEXT","UPD_DT":"TEXT","SALES_REP_ID":"INTEGER","LEGACY_CODE":"TEXT"},"rows":[{"CUST_ID":1,"CUST_NM":"Alice Johnson","CUST_EMAIL":"alice@example.com","CUST_PH":"312-555-0101","ADDR_LINE1":"100 Main St","ADDR_LINE2":null,"CITY_NM":"Chicago","ST_CD":"IL","ZIP_CD":"60601","CTRY_CD":"USA","CUST_TYP":"I","CRDT_LMT":5000.0,"ACCT_STAT":"A","CREAT_DT":"2019-03-12","UPD_DT":"2023-08-01","SALES_REP_ID":1,"LEGACY_CODE":"OLD-00001"},{"CUST_ID":2,"CUST_NM":"Acme Corp","CUST_EMAIL":"contact@acme.com","CUST_PH":"800-555-0200","ADDR_LINE1":"200 Oak Ave","ADDR_LINE2":"Suite 10","CITY_NM":"Springfield","ST_CD":"IL","ZIP_CD":"62701","CTRY_CD":"USA","CUST_TYP":"B","CRDT_LMT":50000.0,"ACCT_STAT":"A","CREAT_DT":"2018-06-01","UPD_DT":"2024-01-15","SALES_REP_ID":2,"LEGACY_CODE":"OLD-00002"},{"CUST_ID":3,"CUST_NM":"Bob Martinez","CUST_EMAIL":"bob.m@example.com","CUST_PH":"773-555-0303","ADDR_LINE1":"45 Lake Shore","ADDR_LINE2":"Apt 3B","CITY_NM":"Chicago","ST_CD":"IL","ZIP_CD":"60614","CTRY_CD":"USA","CUST_TYP":"I","CRDT_LMT":2500.0,"ACCT_STAT":"A","CREAT_DT":"2020-11-20","UPD_DT":"2023-05-10","SALES_REP_ID":1,"LEGACY_CODE":"OLD-00003"},{"CUST_ID":4,"CUST_NM":"Global Widgets","CUST_EMAIL":"info@globalw.com","CUST_PH":"888-555-0400","ADDR_LINE1":"1 Corporate Pl","ADDR_LINE2":null,"CITY_NM":"Dallas","ST_CD":"TX","ZIP_CD":"75201","CTRY_CD":"USA","CUST_TYP":"B","CRDT_LMT":100000.0,"ACCT_STAT":"A","CREAT_DT":"2017-01-05","UPD_DT":"2024-02-28","SALES_REP_ID":3,"LEGACY_CODE":"OLD-00004"},{"CUST_ID":5,"CUST_NM":"Carol Smith","CUST_EMAIL":null,"CUST_PH":"214-555-0505","ADDR_LINE1":"789 Elm St","ADDR_LINE2":null,"CITY_NM":"Dallas","ST_CD":"TX","ZIP_CD":"75202","CTRY_CD":"USA","CUST_TYP":"I","CRDT_LMT":1000.0,"ACCT_STAT":"I","CREAT_DT":"2021-04-30","UPD_DT":null,"SALES_REP_ID":2,"LEGACY_CODE":"OLD-00005"},{"CUST_ID":6,"CUST_NM":"Tech Solutions","CUST_EMAIL":"sales@techsol.com","CUST_PH":"415-555-0606","ADDR_LINE1":"500 Silicon Way","ADDR_LINE2":"Bldg C","CITY_NM":"San Jose","ST_CD":"CA","ZIP_CD":"95110","CTRY_CD":"USA","CUST_TYP":"B","CRDT_LMT":75000.0,"ACCT_STAT":"A","CREAT_DT":"2016-09-15","UPD_DT":"2023-12-01","SALES_REP_ID":3,"LEGACY_CODE":"OLD-00006"},{"CUST_ID":7,"CUST_NM":"Dave Wilson","CUST_EMAIL":"dave.w@personal.net","CUST_PH":"312-555-0707","ADDR_LINE1":"22 Wacker Dr","ADDR_LINE2":null,"CITY_NM":"Chicago","ST_CD":"IL","ZIP_CD":"60606","CTRY_CD":"USA","CUST_TYP":"I","CRDT_LMT":3000.0,"ACCT_STAT":"A","CREAT_DT":"2022-02-14","UPD_DT":"2024-01-05","SALES_REP_ID":1,"LEGACY_CODE":"OLD-00007"},{"CUST_ID":8,"CUST_NM":"NorthStar LLC","CUST_EMAIL":"ops@northstar.biz","CUST_PH":"617-555-0808","ADDR_LINE1":"99 Boylston St","ADDR_LINE2":null,"CITY_NM":"Boston","ST_CD":"MA","ZIP_CD":"02116","CTRY_CD":"USA","CUST_TYP":"B","CRDT_LMT":25000.0,"ACCT_STAT":"I","CREAT_DT":"2020-07-07","UPD_DT":"2022-09-30","SALES_REP_ID":2,"LEGACY_CODE":"OLD-00008"},{"CUST_ID":9,"CUST_NM":"Eva Brown","CUST_EMAIL":"eva@example.org","CUST_PH":"617-555-0909","ADDR_LINE1":"8 Beacon Hill","ADDR_LINE2":"Apt 1","CITY_NM":"Boston","ST_CD":"MA","ZIP_CD":"02108","CTRY_CD":"USA","CUST_TYP":"I","CRDT_LMT":1500.0,"ACCT_STAT":"A","CREAT_DT":"2023-01-01","UPD_DT":"2023-06-15","SALES_REP_ID":3,"LEGACY_CODE":"OLD-00009"},{"CUST_ID":10,"CUST_NM":"Sunrise Imports","CUST_EMAIL":"trade@sunrise.com","CUST_PH":"305-555-1010","ADDR_LINE1":"1200 Brickell","ADDR_LINE2":null,"CITY_NM":"Miami","ST_CD":"FL","ZIP_CD":"33131","CTRY_CD":"CAN","CUST_TYP":"B","CRDT_LMT":40000.0,"ACCT_STAT":"A","CREAT_DT":"2019-11-11","UPD_DT":"2024-03-20","SALES_REP_ID":1,"LEGACY_CODE":"OLD-00010"}]},"PRICE_LIST":{"columns":["PRODUCT_CODE","PRODUCT_NAME","UNIT_PRICE","DISCOUNT_PCT","EFFECTIVE_DATE","IS_ACTIVE","STOCK_QTY"],"types":{"PRODUCT_CODE":"TEXT","PRODUCT_NAME":"TEXT","UNIT_PRICE":"REAL","DISCOUNT_PCT":"REAL","EFFECTIVE_DATE":"DATE","IS_ACTIVE":"BOOLEAN","STOCK_QTY":"INTEGER"},"source_type":"Excel","rows":[{"PRODUCT_CODE":"PRD-001","PRODUCT_NAME":"Widget Alpha","UNIT_PRICE":9.99,"DISCOUNT_PCT":0.1,"EFFECTIVE_DATE":"2023-01-01","IS_ACTIVE":true,"STOCK_QTY":1500},{"PRODUCT_CODE":"PRD-002","PRODUCT_NAME":"Widget Beta","UNIT_PRICE":19.99,"DISCOUNT_PCT":0.05,"EFFECTIVE_DATE":"2023-01-01","IS_ACTIVE":true,"STOCK_QTY":820},{"PRODUCT_CODE":"PRD-003","PRODUCT_NAME":"Gadget Pro","UNIT_PRICE":49.99,"DISCOUNT_PCT":0.0,"EFFECTIVE_DATE":"2023-06-01","IS_ACTIVE":true,"STOCK_QTY":310},{"PRODUCT_CODE":"PRD-004","PRODUCT_NAME":"Legacy Part","UNIT_PRICE":4.5,"DISCOUNT_PCT":0.2,"EFFECTIVE_DATE":"2021-03-15","IS_ACTIVE":false,"STOCK_QTY":0},{"PRODUCT_CODE":"PRD-005","PRODUCT_NAME":"Premium Suite","UNIT_PRICE":299.0,"DISCOUNT_PCT":0.15,"EFFECTIVE_DATE":"2024-01-01","IS_ACTIVE":true,"STOCK_QTY":55},{"PRODUCT_CODE":"PRD-006","PRODUCT_NAME":"Basic Pack","UNIT_PRICE":14.99,"DISCOUNT_PCT":0.0,"EFFECTIVE_DATE":"2023-09-01","IS_ACTIVE":true,"STOCK_QTY":2100},{"PRODUCT_CODE":"PRD-007","PRODUCT_NAME":"Accessory Kit","UNIT_PRICE":7.25,"DISCOUNT_PCT":0.1,"EFFECTIVE_DATE":"2022-04-01","IS_ACTIVE":null,"STOCK_QTY":430}]},"CONTRACTS":{"columns":["FILENAME","CUST_ID_EXTRACTED"],"types":{"FILENAME":"VARCHAR","CUST_ID_EXTRACTED":"VARCHAR"},"source_type":"Documents","rows":[{"FILENAME":"CUST-00001_contract.docx","CUST_ID_EXTRACTED":"1"},{"FILENAME":"CUST-00002_contract.docx","CUST_ID_EXTRACTED":"2"},{"FILENAME":"CUST-00004_contract.docx","CUST_ID_EXTRACTED":"4"},{"FILENAME":"CUST-00006_contract.docx","CUST_ID_EXTRACTED":"6"},{"FILENAME":"CUST-00009_contract.docx","CUST_ID_EXTRACTED":"9"}]}},"destination":{"SalesReps":{"columns":["RepId","FullName","EmailAddress","Region"],"types":{"RepId":"INTEGER","FullName":"TEXT","EmailAddress":"TEXT","Region":"TEXT"},"rows":[{"RepId":1,"FullName":"Sandra Lee","EmailAddress":"sandra.lee@company.com","Region":"MIDWEST"},{"RepId":2,"FullName":"Tom Garcia","EmailAddress":"tom.garcia@company.com","Region":"SOUTH"},{"RepId":3,"FullName":"Nina Patel","EmailAddress":"nina.patel@company.com","Region":"WEST"}]},"Customers":{"columns":["CustomerId","FullName","EmailAddress","PhoneNumber","AddressLine1","AddressLine2","City","StateProvince","PostalCode","CountryCode","CustomerType","CreditLimit","IsActive","CreatedAt","UpdatedAt","AssignedRepId","ExternalRef","Tags"],"types":{"CustomerId":"INTEGER","FullName":"TEXT","EmailAddress":"TEXT","PhoneNumber":"TEXT","AddressLine1":"TEXT","AddressLine2":"TEXT","City":"TEXT","StateProvince":"TEXT","PostalCode":"TEXT","CountryCode":"TEXT","CustomerType":"TEXT","CreditLimit":"REAL","IsActive":"INTEGER","CreatedAt":"TEXT","UpdatedAt":"TEXT","AssignedRepId":"INTEGER","ExternalRef":"TEXT","Tags":"TEXT"},"rows":[{"CustomerId":1,"FullName":"Alice Johnson","EmailAddress":"alice@example.com","PhoneNumber":"312-555-0101","AddressLine1":"100 Main St","AddressLine2":null,"City":"Chicago","StateProvince":"IL","PostalCode":"60601","CountryCode":"US","CustomerType":"Individual","CreditLimit":5000.0,"IsActive":1,"CreatedAt":"2019-03-12","UpdatedAt":"2023-08-01","AssignedRepId":1,"ExternalRef":"OLD-00001","Tags":null},{"CustomerId":2,"FullName":"Acme Corp","EmailAddress":"contact@acme.com","PhoneNumber":"800-555-0200","AddressLine1":"200 Oak Ave","AddressLine2":"Suite 10","City":"Springfield","StateProvince":"IL","PostalCode":"62701","CountryCode":"US","CustomerType":"Business","CreditLimit":50000.0,"IsActive":1,"CreatedAt":"2018-06-01","UpdatedAt":"2024-01-15","AssignedRepId":2,"ExternalRef":"OLD-00002","Tags":null},{"CustomerId":3,"FullName":"Bob Martinez","EmailAddress":"bob.m@example.com","PhoneNumber":"773-555-0303","AddressLine1":"45 Lake Shore","AddressLine2":"Apt 3B","City":"Chicago","StateProvince":"IL","PostalCode":"60614","CountryCode":"US","CustomerType":"Individual","CreditLimit":2500.0,"IsActive":1,"CreatedAt":"2020-11-20","UpdatedAt":"2023-05-10","AssignedRepId":1,"ExternalRef":"OLD-00003","Tags":null},{"CustomerId":4,"FullName":"Global Widgets","EmailAddress":"info@globalw.com","PhoneNumber":"888-555-0400","AddressLine1":"1 Corporate Pl","AddressLine2":null,"City":"Dallas","StateProvince":"TX","PostalCode":"75201","CountryCode":"US","CustomerType":"Business","CreditLimit":100000.0,"IsActive":1,"CreatedAt":"2017-01-05","UpdatedAt":"2024-02-28","AssignedRepId":3,"ExternalRef":"OLD-00004","Tags":null},{"CustomerId":5,"FullName":"Carol Smith","EmailAddress":null,"PhoneNumber":"214-555-0505","AddressLine1":"789 Elm St","AddressLine2":null,"City":"Dallas","StateProvince":"TX","PostalCode":"75202","CountryCode":"US","CustomerType":"Individual","CreditLimit":1000.0,"IsActive":0,"CreatedAt":"2021-04-30","UpdatedAt":null,"AssignedRepId":2,"ExternalRef":"OLD-00005","Tags":null},{"CustomerId":6,"FullName":"Tech Solutions","EmailAddress":"sales@techsol.com","PhoneNumber":"415-555-0606","AddressLine1":"500 Silicon Way","AddressLine2":"Bldg C","City":"San Jose","StateProvince":"CA","PostalCode":"95110","CountryCode":"US","CustomerType":"Business","CreditLimit":75000.0,"IsActive":1,"CreatedAt":"2016-09-15","UpdatedAt":"2023-12-01","AssignedRepId":3,"ExternalRef":"OLD-00006","Tags":null},{"CustomerId":7,"FullName":"Dave Wilson","EmailAddress":"dave.w@personal.net","PhoneNumber":"312-555-0707","AddressLine1":"22 Wacker Dr","AddressLine2":null,"City":"Chicago","StateProvince":"IL","PostalCode":"60606","CountryCode":"US","CustomerType":"Individual","CreditLimit":3000.0,"IsActive":1,"CreatedAt":"2022-02-14","UpdatedAt":"2024-01-05","AssignedRepId":1,"ExternalRef":"OLD-00007","Tags":null},{"CustomerId":8,"FullName":"NorthStar LLC","EmailAddress":"ops@northstar.biz","PhoneNumber":"617-555-0808","AddressLine1":"99 Boylston St","AddressLine2":null,"City":"Boston","StateProvince":"MA","PostalCode":"02116","CountryCode":"US","CustomerType":"Business","CreditLimit":25000.0,"IsActive":0,"CreatedAt":"2020-07-07","UpdatedAt":"2022-09-30","AssignedRepId":2,"ExternalRef":"OLD-00008","Tags":null},{"CustomerId":9,"FullName":"Eva Brown","EmailAddress":"eva@example.org","PhoneNumber":"617-555-0909","AddressLine1":"8 Beacon Hill","AddressLine2":"Apt 1","City":"Boston","StateProvince":"MA","PostalCode":"02108","CountryCode":"US","CustomerType":"Individual","CreditLimit":1500.0,"IsActive":1,"CreatedAt":"2023-01-01","UpdatedAt":"2023-06-15","AssignedRepId":3,"ExternalRef":"OLD-00009","Tags":null},{"CustomerId":10,"FullName":"Sunrise Imports","EmailAddress":"trade@sunrise.com","PhoneNumber":"305-555-1010","AddressLine1":"1200 Brickell","AddressLine2":null,"City":"Miami","StateProvince":"FL","PostalCode":"33131","CountryCode":"CA","CustomerType":"Business","CreditLimit":40000.0,"IsActive":1,"CreatedAt":"2019-11-11","UpdatedAt":"2024-03-20","AssignedRepId":1,"ExternalRef":"OLD-00010","Tags":null}]},"Products":{"columns":["ProductCode","ProductName","UnitPrice","DiscountPct","EffectiveDate","IsActive","StockQuantity"],"types":{"ProductCode":"TEXT","ProductName":"TEXT","UnitPrice":"REAL","DiscountPct":"REAL","EffectiveDate":"TEXT","IsActive":"INTEGER","StockQuantity":"INTEGER"},"rows":[{"ProductCode":"PRD-001","ProductName":"Widget Alpha","UnitPrice":9.99,"DiscountPct":0.1,"EffectiveDate":"2023-01-01","IsActive":1,"StockQuantity":1500},{"ProductCode":"PRD-002","ProductName":"Widget Beta","UnitPrice":19.99,"DiscountPct":0.05,"EffectiveDate":"2023-01-01","IsActive":1,"StockQuantity":820},{"ProductCode":"PRD-003","ProductName":"Gadget Pro","UnitPrice":49.99,"DiscountPct":0.0,"EffectiveDate":"2023-06-01","IsActive":1,"StockQuantity":310},{"ProductCode":"PRD-004","ProductName":"Legacy Part","UnitPrice":4.5,"DiscountPct":0.2,"EffectiveDate":"2021-03-15","IsActive":0,"StockQuantity":0},{"ProductCode":"PRD-005","ProductName":"Premium Suite","UnitPrice":299.0,"DiscountPct":0.15,"EffectiveDate":"2024-01-01","IsActive":1,"StockQuantity":55},{"ProductCode":"PRD-006","ProductName":"Basic Pack","UnitPrice":14.99,"DiscountPct":0.0,"EffectiveDate":"2023-09-01","IsActive":1,"StockQuantity":2100},{"ProductCode":"PRD-007","ProductName":"Accessory Kit","UnitPrice":7.25,"DiscountPct":0.1,"EffectiveDate":"2022-04-01","IsActive":null,"StockQuantity":430}]},"CustomerDocuments":{"columns":["CustomerId","DocumentPath","DocumentType"],"types":{"CustomerId":"INTEGER","DocumentPath":"TEXT","DocumentType":"TEXT"},"rows":[{"CustomerId":1,"DocumentPath":"CUST-00001_contract.docx","DocumentType":null},{"CustomerId":2,"DocumentPath":"CUST-00002_contract.docx","DocumentType":null},{"CustomerId":4,"DocumentPath":"CUST-00004_contract.docx","DocumentType":null},{"CustomerId":6,"DocumentPath":"CUST-00006_contract.docx","DocumentType":null},{"CustomerId":9,"DocumentPath":"CUST-00009_contract.docx","DocumentType":null}]}}};

const SOURCE_META = {
  SALES_REP:   { label: "SALES_REP",   system: "crm_db",      kind: "SQLite DB",   color: "#3B82F6" },
  CUST_MASTER: { label: "CUST_MASTER", system: "crm_db",      kind: "SQLite DB",   color: "#3B82F6" },
  PRICE_LIST:  { label: "PRICE_LIST",  system: "price_excel", kind: "Excel Sheet", color: "#22C55E" },
  CONTRACTS:   { label: "CONTRACTS",   system: "contracts",   kind: "DOCX Files",  color: "#F59E0B" },
};

const SAMPLE_MAPPING = [
  {src_table:"SALES_REP",src_col:"REP_ID",dst_table:"SalesReps",dst_col:"RepId",transform:"Direct copy",confidence:"High",status:"Mapped",notes:"Primary key"},
  {src_table:"SALES_REP",src_col:"REP_NM",dst_table:"SalesReps",dst_col:"FullName",transform:"Direct copy",confidence:"High",status:"Mapped",notes:""},
  {src_table:"SALES_REP",src_col:"REP_EMAIL",dst_table:"SalesReps",dst_col:"EmailAddress",transform:"Direct copy",confidence:"High",status:"Mapped",notes:""},
  {src_table:"SALES_REP",src_col:"REGION_CD",dst_table:"SalesReps",dst_col:"Region",transform:"Direct copy",confidence:"High",status:"Mapped",notes:""},
  {src_table:"CUST_MASTER",src_col:"CUST_ID",dst_table:"Customers",dst_col:"CustomerId",transform:"Direct copy",confidence:"High",status:"Mapped",notes:""},
  {src_table:"CUST_MASTER",src_col:"CUST_NM",dst_table:"Customers",dst_col:"FullName",transform:"Direct copy",confidence:"High",status:"Mapped",notes:""},
  {src_table:"CUST_MASTER",src_col:"CUST_EMAIL",dst_table:"Customers",dst_col:"EmailAddress",transform:"Direct copy",confidence:"High",status:"Mapped",notes:""},
  {src_table:"CUST_MASTER",src_col:"CUST_PH",dst_table:"Customers",dst_col:"PhoneNumber",transform:"Direct copy",confidence:"High",status:"Mapped",notes:""},
  {src_table:"CUST_MASTER",src_col:"CTRY_CD",dst_table:"Customers",dst_col:"CountryCode",transform:"Lookup: USA→US, CAN→CA",confidence:"High",status:"Mapped",notes:"ISO-3 to ISO-2"},
  {src_table:"CUST_MASTER",src_col:"CUST_TYP",dst_table:"Customers",dst_col:"CustomerType",transform:"Case: B→Business, I→Individual",confidence:"High",status:"Mapped",notes:""},
  {src_table:"CUST_MASTER",src_col:"ACCT_STAT",dst_table:"Customers",dst_col:"IsActive",transform:"Case: A→1, I→0",confidence:"High",status:"Mapped",notes:""},
  {src_table:"CUST_MASTER",src_col:"CRDT_LMT",dst_table:"Customers",dst_col:"CreditLimit",transform:"Direct copy",confidence:"High",status:"Mapped",notes:""},
  {src_table:"CUST_MASTER",src_col:"SALES_REP_ID",dst_table:"Customers",dst_col:"AssignedRepId",transform:"Direct copy",confidence:"High",status:"Mapped",notes:"FK → SalesReps"},
  {src_table:"PRICE_LIST",src_col:"PRODUCT_CODE",dst_table:"Products",dst_col:"ProductCode",transform:"Direct copy",confidence:"High",status:"Mapped",notes:""},
  {src_table:"PRICE_LIST",src_col:"PRODUCT_NAME",dst_table:"Products",dst_col:"ProductName",transform:"Direct copy",confidence:"High",status:"Mapped",notes:""},
  {src_table:"PRICE_LIST",src_col:"UNIT_PRICE",dst_table:"Products",dst_col:"UnitPrice",transform:"Direct copy",confidence:"High",status:"Mapped",notes:""},
  {src_table:"PRICE_LIST",src_col:"DISCOUNT_PCT",dst_table:"Products",dst_col:"DiscountPct",transform:"Direct copy",confidence:"High",status:"Mapped",notes:""},
  {src_table:"PRICE_LIST",src_col:"IS_ACTIVE",dst_table:"Products",dst_col:"IsActive",transform:"Cast to INT",confidence:"High",status:"Mapped",notes:""},
  {src_table:"CONTRACTS",src_col:"FILENAME",dst_table:"CustomerDocuments",dst_col:"DocumentPath",transform:"Direct copy",confidence:"High",status:"Mapped",notes:""},
  {src_table:"CONTRACTS",src_col:"CUST_ID_EXTRACTED",dst_table:"CustomerDocuments",dst_col:"CustomerId",transform:"Regex: CUST-(\\d+)",confidence:"High",status:"Mapped",notes:"FK → Customers"},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Badge({ text, color = "#64748B" }) {
  return (
    <span style={{
      display:"inline-block", padding:"1px 8px", borderRadius:9999,
      background: color + "22", color, border:`1px solid ${color}55`,
      fontSize:11, fontWeight:600, whiteSpace:"nowrap"
    }}>{text}</span>
  );
}

function DataTable({ columns, rows, maxRows = 100 }) {
  const display = rows.slice(0, maxRows);
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ borderCollapse:"collapse", fontSize:12, width:"100%", minWidth: columns.length * 100 }}>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c} style={{
                padding:"6px 10px", textAlign:"left", background:"#1E293B",
                color:"#94A3B8", fontWeight:600, fontSize:11, whiteSpace:"nowrap",
                borderBottom:"1px solid #334155", position:"sticky", top:0
              }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {display.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#0F172A" : "#111827" }}>
              {columns.map(c => {
                const v = row[c];
                const isNull = v === null || v === undefined;
                return (
                  <td key={c} style={{
                    padding:"5px 10px", borderBottom:"1px solid #1E293B",
                    color: isNull ? "#475569" : "#E2E8F0", whiteSpace:"nowrap",
                    fontFamily: typeof v === "number" ? "monospace" : "inherit",
                    fontStyle: isNull ? "italic" : "normal"
                  }}>
                    {isNull ? "NULL" : String(v)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > maxRows && (
        <div style={{ padding:"6px 10px", color:"#64748B", fontSize:11 }}>
          Showing {maxRows} of {rows.length} rows
        </div>
      )}
    </div>
  );
}

// ─── TAB 1: Data Explorer ─────────────────────────────────────────────────────
function DataExplorer() {
  const [side, setSide] = useState("source");
  const [activeTable, setActiveTable] = useState("CUST_MASTER");

  const tables = side === "source"
    ? Object.keys(DB.source)
    : Object.keys(DB.destination);

  useEffect(() => {
    setActiveTable(tables[0]);
  }, [side]);

  const tbl = side === "source" ? DB.source[activeTable] : DB.destination[activeTable];
  const meta = side === "source" ? SOURCE_META[activeTable] : null;

  return (
    <div style={{ display:"flex", gap:0, height:"100%", minHeight:500 }}>
      {/* Sidebar */}
      <div style={{ width:200, flexShrink:0, background:"#0F172A", borderRight:"1px solid #1E293B", overflowY:"auto" }}>
        <div style={{ padding:"12px 10px 6px", fontSize:10, fontWeight:700, color:"#475569", letterSpacing:1 }}>
          DATA SOURCES
        </div>
        {["source","destination"].map(s => (
          <div key={s}>
            <div
              onClick={() => setSide(s)}
              style={{
                padding:"6px 12px", cursor:"pointer", fontSize:11, fontWeight:700,
                color: side === s ? "#38BDF8" : "#64748B",
                background: side === s ? "#0EA5E920" : "transparent",
                borderLeft: side === s ? "2px solid #38BDF8" : "2px solid transparent",
                letterSpacing:0.5, textTransform:"uppercase"
              }}
            >
              {s === "source" ? "⬤ Source" : "⬤ Destination"}
            </div>
            {side === s && Object.keys(side === "source" ? DB.source : DB.destination).map(t => {
              const m = side === "source" ? SOURCE_META[t] : null;
              return (
                <div
                  key={t}
                  onClick={() => setActiveTable(t)}
                  style={{
                    padding:"5px 10px 5px 22px", cursor:"pointer",
                    background: activeTable === t ? "#1E293B" : "transparent",
                    fontSize:12, color: activeTable === t ? "#F1F5F9" : "#94A3B8",
                    display:"flex", alignItems:"center", gap:6
                  }}
                >
                  <span style={{
                    width:6, height:6, borderRadius:2, flexShrink:0,
                    background: m ? m.color : "#8B5CF6"
                  }}/>
                  {t}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Main panel */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Table header */}
        <div style={{
          padding:"10px 16px", background:"#1E293B",
          borderBottom:"1px solid #334155", display:"flex", alignItems:"center", gap:10
        }}>
          <span style={{ fontWeight:700, color:"#F1F5F9", fontSize:14 }}>{activeTable}</span>
          {meta && <Badge text={meta.kind} color={meta.color}/>}
          {meta && <Badge text={meta.system} color="#6366F1"/>}
          <span style={{ marginLeft:"auto", color:"#64748B", fontSize:12 }}>
            {tbl?.rows?.length} rows · {tbl?.columns?.length} columns
          </span>
        </div>

        {/* Schema strip */}
        <div style={{
          padding:"6px 16px", background:"#0F172A", borderBottom:"1px solid #1E293B",
          display:"flex", flexWrap:"wrap", gap:6
        }}>
          {tbl?.columns?.map(c => (
            <span key={c} style={{
              fontSize:10, padding:"2px 7px", borderRadius:4,
              background:"#1E293B", color:"#94A3B8", border:"1px solid #334155"
            }}>
              {c} <span style={{ color:"#475569" }}>{tbl.types?.[c]}</span>
            </span>
          ))}
        </div>

        {/* Data */}
        <div style={{ flex:1, overflowY:"auto" }}>
          {tbl && <DataTable columns={tbl.columns} rows={tbl.rows}/>}
        </div>
      </div>
    </div>
  );
}

// ─── TAB 2: Mapping Viewer ────────────────────────────────────────────────────
function MappingViewer({ mappings }) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const srcTables = [...new Set(mappings.map(m => m.src_table))];
  const tabs = ["ALL", ...srcTables];

  const visible = mappings.filter(m => {
    const matchTab = filter === "ALL" || m.src_table === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || m.src_col.toLowerCase().includes(q) || m.dst_col.toLowerCase().includes(q) || m.transform.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const confColor = c => c === "High" ? "#22C55E" : c === "Medium" ? "#F59E0B" : "#EF4444";

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:500 }}>
      {/* Controls */}
      <div style={{ padding:"10px 16px", background:"#1E293B", borderBottom:"1px solid #334155", display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:4 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding:"4px 10px", borderRadius:6, border:"none", cursor:"pointer", fontSize:11, fontWeight:600,
              background: filter === t ? "#3B82F6" : "#0F172A",
              color: filter === t ? "#fff" : "#94A3B8"
            }}>{t}</button>
          ))}
        </div>
        <input
          placeholder="Search columns or transforms…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            marginLeft:"auto", padding:"4px 10px", borderRadius:6, border:"1px solid #334155",
            background:"#0F172A", color:"#E2E8F0", fontSize:12, width:220
          }}
        />
        <span style={{ color:"#64748B", fontSize:12 }}>{visible.length} mappings</span>
      </div>

      {/* Table */}
      <div style={{ flex:1, overflowY:"auto" }}>
        <table style={{ borderCollapse:"collapse", fontSize:12, width:"100%" }}>
          <thead>
            <tr>
              {["Source Table","Source Column","Destination Table","Destination Column","Transformation","Confidence","Notes"].map(h => (
                <th key={h} style={{
                  padding:"7px 12px", textAlign:"left", background:"#1E293B",
                  color:"#94A3B8", fontSize:11, fontWeight:600, borderBottom:"1px solid #334155",
                  position:"sticky", top:0, whiteSpace:"nowrap"
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((m, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#0F172A" : "#111827" }}>
                <td style={{ padding:"6px 12px", color:"#60A5FA", borderBottom:"1px solid #1E293B", whiteSpace:"nowrap" }}>{m.src_table}</td>
                <td style={{ padding:"6px 12px", color:"#F1F5F9", borderBottom:"1px solid #1E293B", fontFamily:"monospace", whiteSpace:"nowrap" }}>{m.src_col}</td>
                <td style={{ padding:"6px 12px", color:"#A78BFA", borderBottom:"1px solid #1E293B", whiteSpace:"nowrap" }}>{m.dst_table}</td>
                <td style={{ padding:"6px 12px", color:"#F1F5F9", borderBottom:"1px solid #1E293B", fontFamily:"monospace", whiteSpace:"nowrap" }}>{m.dst_col}</td>
                <td style={{ padding:"6px 12px", color:"#94A3B8", borderBottom:"1px solid #1E293B" }}>
                  {m.transform !== "Direct copy"
                    ? <span style={{ color:"#FB923C" }}>{m.transform}</span>
                    : <span style={{ color:"#475569" }}>Direct copy</span>}
                </td>
                <td style={{ padding:"6px 12px", borderBottom:"1px solid #1E293B" }}>
                  <Badge text={m.confidence} color={confColor(m.confidence)}/>
                </td>
                <td style={{ padding:"6px 12px", color:"#64748B", borderBottom:"1px solid #1E293B", fontSize:11 }}>{m.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── TAB 3: Mapping Workshop ──────────────────────────────────────────────────
function MappingWorkshop({ onMappingsLoaded }) {
  const [mode, setMode] = useState(null); // "upload" | "chat"
  const [uploadText, setUploadText] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef();

  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatDone, setChatDone] = useState(false);
  const chatEndRef = useRef();

  useEffect(() => {
    if (mode === "chat" && messages.length === 0) {
      // Kick off with the consultant's opening
      const opening = {
        role:"assistant",
        content:`Hello! I'm your migration consultant. I'll help you derive a field mapping specification through a structured discussion about your source systems.\n\nLet's start with the basics:\n\n**What legacy system are you migrating from?** For example: a CRM, ERP, custom database, spreadsheets? And roughly how many tables or data entities are involved?`
      };
      setMessages([opening]);
    }
  }, [mode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  // ── Upload handler ──
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const arr = Array.isArray(parsed) ? parsed : parsed.mappings;
        if (!arr || !Array.isArray(arr)) throw new Error("Expected an array of mappings or {mappings:[…]}");
        setUploadText(JSON.stringify(arr, null, 2));
        setUploadError("");
      } catch (err) {
        setUploadError("Invalid JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handlePaste = (e) => {
    try {
      const parsed = JSON.parse(e.target.value);
      const arr = Array.isArray(parsed) ? parsed : parsed.mappings;
      if (!arr || !Array.isArray(arr)) throw new Error("Expected array");
      setUploadText(e.target.value);
      setUploadError("");
    } catch {
      setUploadText(e.target.value);
      setUploadError(e.target.value.trim() ? "Not valid JSON yet…" : "");
    }
  };

  const applyUpload = () => {
    try {
      const parsed = JSON.parse(uploadText);
      const arr = Array.isArray(parsed) ? parsed : parsed.mappings;
      onMappingsLoaded(arr, "upload");
    } catch (err) {
      setUploadError("Cannot parse: " + err.message);
    }
  };

  // ── Chat handler ──
  const systemPrompt = `You are a senior data migration consultant conducting a discovery interview with a client to derive a field mapping specification.

Your goal is to understand their source systems and produce a final field_mapping.json document. The destination schema is a modern CRM with these tables:
- SalesReps (RepId, FullName, EmailAddress, Region)
- Customers (CustomerId, FullName, EmailAddress, PhoneNumber, AddressLine1, AddressLine2, City, StateProvince, PostalCode, CountryCode, CustomerType, CreditLimit, IsActive, CreatedAt, UpdatedAt, AssignedRepId, ExternalRef, Tags)
- Products (ProductCode, ProductName, UnitPrice, DiscountPct, EffectiveDate, IsActive, StockQuantity)
- CustomerDocuments (CustomerId, DocumentPath, DocumentType)

Conduct a natural conversation. Ask one or two focused questions at a time. Explore:
1. Source system type (database, Excel, documents, APIs)
2. Table/sheet names and column names
3. Data types and value formats
4. Transformation requirements (lookups, code mappings, derived fields)
5. Data quality concerns (nulls, duplicates, encoding)

When you have enough information, say "I have enough information to draft the mapping. Let me generate it." Then output a JSON code block like:
\`\`\`json
[{"src_table":"...","src_col":"...","dst_table":"...","dst_col":"...","transform":"...","confidence":"High|Medium|Low","status":"Mapped","notes":"..."}]
\`\`\`

Keep responses concise and professional. One topic at a time.`;

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role:"user", content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:1000,
          system: systemPrompt,
          messages: next.map(m => ({ role:m.role, content:m.content }))
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't respond.";
      const assistantMsg = { role:"assistant", content: reply };
      setMessages(prev => [...prev, assistantMsg]);

      // Check if a JSON mapping block was produced
      const match = reply.match(/```json\n([\s\S]*?)\n```/);
      if (match) {
        try {
          const arr = JSON.parse(match[1]);
          if (Array.isArray(arr) && arr.length > 0) {
            setChatDone(true);
            onMappingsLoaded(arr, "chat");
          }
        } catch {}
      }
    } catch (err) {
      setMessages(prev => [...prev, { role:"assistant", content:"Connection error: " + err.message }]);
    }
    setLoading(false);
  };

  // ── Mode selector ──
  if (!mode) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:480, gap:24 }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:18, fontWeight:700, color:"#F1F5F9", marginBottom:8 }}>Mapping Workshop</div>
        <div style={{ color:"#64748B", fontSize:13 }}>Choose how you'd like to define the field mapping for this migration.</div>
      </div>
      <div style={{ display:"flex", gap:20 }}>
        {[
          { id:"upload", icon:"📂", title:"Upload Mapping File", desc:"Provide an existing field_mapping.json or paste raw JSON" },
          { id:"chat",   icon:"💬", title:"Derive via Conversation", desc:"Chat with an AI consultant to discover and document your mapping" },
        ].map(opt => (
          <div key={opt.id} onClick={() => setMode(opt.id)} style={{
            width:220, padding:24, borderRadius:12, border:"1px solid #334155",
            background:"#1E293B", cursor:"pointer", textAlign:"center",
            transition:"border-color 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor="#3B82F6"}
            onMouseLeave={e => e.currentTarget.style.borderColor="#334155"}
          >
            <div style={{ fontSize:32, marginBottom:12 }}>{opt.icon}</div>
            <div style={{ fontWeight:700, color:"#F1F5F9", fontSize:14, marginBottom:8 }}>{opt.title}</div>
            <div style={{ color:"#64748B", fontSize:12, lineHeight:1.5 }}>{opt.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Upload UI ──
  if (mode === "upload") return (
    <div style={{ padding:24, maxWidth:720, margin:"0 auto" }}>
      <button onClick={() => setMode(null)} style={{ background:"none", border:"none", color:"#64748B", cursor:"pointer", fontSize:12, marginBottom:16 }}>← Back</button>
      <div style={{ fontSize:16, fontWeight:700, color:"#F1F5F9", marginBottom:4 }}>Upload Mapping File</div>
      <div style={{ color:"#64748B", fontSize:12, marginBottom:16 }}>
        Upload a <code>field_mapping.json</code> file or paste raw JSON. Expected format: an array of mapping objects with fields <code>src_table, src_col, dst_table, dst_col, transform, confidence, status, notes</code>.
      </div>

      <div
        onClick={() => fileRef.current?.click()}
        style={{
          border:"2px dashed #334155", borderRadius:10, padding:"20px", textAlign:"center",
          cursor:"pointer", marginBottom:12, color:"#64748B", fontSize:13
        }}
      >
        Click to select a file, or drag & drop
        <input ref={fileRef} type="file" accept=".json" style={{ display:"none" }} onChange={handleFile}/>
      </div>

      <textarea
        value={uploadText}
        onChange={handlePaste}
        placeholder='[{"src_table":"CUST_MASTER","src_col":"CUST_ID","dst_table":"Customers","dst_col":"CustomerId","transform":"Direct copy","confidence":"High","status":"Mapped","notes":""}]'
        style={{
          width:"100%", height:200, padding:12, borderRadius:8, border:"1px solid #334155",
          background:"#0F172A", color:"#E2E8F0", fontSize:11, fontFamily:"monospace",
          resize:"vertical", boxSizing:"border-box"
        }}
      />
      {uploadError && <div style={{ color:"#EF4444", fontSize:12, marginTop:4 }}>{uploadError}</div>}

      <div style={{ display:"flex", gap:10, marginTop:12 }}>
        <button onClick={applyUpload} disabled={!uploadText.trim() || !!uploadError}
          style={{
            padding:"8px 20px", borderRadius:8, border:"none", cursor:"pointer",
            background: uploadText.trim() && !uploadError ? "#3B82F6" : "#334155",
            color: uploadText.trim() && !uploadError ? "#fff" : "#64748B", fontSize:13, fontWeight:600
          }}>
          Apply Mapping →
        </button>
        <button onClick={() => { setUploadText(JSON.stringify(SAMPLE_MAPPING, null, 2)); setUploadError(""); }}
          style={{ padding:"8px 16px", borderRadius:8, border:"1px solid #334155", background:"#1E293B", color:"#94A3B8", cursor:"pointer", fontSize:12 }}>
          Load Sample Mapping
        </button>
      </div>
    </div>
  );

  // ── Chat UI ──
  return (
    <div style={{ display:"flex", flexDirection:"column", height:520 }}>
      <div style={{ padding:"8px 16px", background:"#1E293B", borderBottom:"1px solid #334155", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={() => { setMode(null); setMessages([]); setChatDone(false); }}
          style={{ background:"none", border:"none", color:"#64748B", cursor:"pointer", fontSize:12 }}>← Back</button>
        <span style={{ color:"#F1F5F9", fontSize:13, fontWeight:600 }}>Migration Discovery Chat</span>
        {chatDone && <Badge text="✓ Mapping Generated" color="#22C55E"/>}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display:"flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth:"75%", padding:"10px 14px", borderRadius:12,
              background: m.role === "user" ? "#3B82F6" : "#1E293B",
              color: "#F1F5F9", fontSize:13, lineHeight:1.6,
              borderBottomRightRadius: m.role === "user" ? 4 : 12,
              borderBottomLeftRadius: m.role === "assistant" ? 4 : 12,
              whiteSpace:"pre-wrap"
            }}>
              {m.content.replace(/```json[\s\S]*?```/g, "[📋 Field mapping JSON generated — see Mapping Viewer tab]")}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex" }}>
            <div style={{ padding:"10px 14px", borderRadius:12, background:"#1E293B", color:"#64748B", fontSize:13 }}>
              Thinking…
            </div>
          </div>
        )}
        <div ref={chatEndRef}/>
      </div>

      <div style={{ padding:"10px 12px", borderTop:"1px solid #334155", display:"flex", gap:8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Describe your source system…"
          disabled={loading || chatDone}
          style={{
            flex:1, padding:"8px 12px", borderRadius:8, border:"1px solid #334155",
            background:"#0F172A", color:"#E2E8F0", fontSize:13
          }}
        />
        <button onClick={sendMessage} disabled={loading || chatDone || !input.trim()}
          style={{
            padding:"8px 18px", borderRadius:8, border:"none", cursor:"pointer",
            background: (!loading && !chatDone && input.trim()) ? "#3B82F6" : "#334155",
            color: (!loading && !chatDone && input.trim()) ? "#fff" : "#64748B",
            fontSize:13, fontWeight:600
          }}>Send</button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("explorer");
  const [mappings, setMappings] = useState(SAMPLE_MAPPING);
  const [mappingSource, setMappingSource] = useState("sample");
  const [notify, setNotify] = useState(null);

  const handleMappingsLoaded = (arr, source) => {
    setMappings(arr);
    setMappingSource(source);
    setNotify(source === "upload" ? `✓ Mapping loaded — ${arr.length} entries` : `✓ Mapping derived from conversation — ${arr.length} entries`);
    setTimeout(() => setNotify(null), 4000);
    setTab("mapping");
  };

  const tabs = [
    { id:"explorer", label:"🗄️  Data Explorer" },
    { id:"mapping",  label:"🔗  Mapping Viewer" },
    { id:"workshop", label:"⚙️  Mapping Workshop" },
  ];

  return (
    <div style={{ fontFamily:"system-ui, sans-serif", background:"#020617", minHeight:"100vh", color:"#E2E8F0" }}>
      {/* Header */}
      <div style={{ background:"#0F172A", borderBottom:"1px solid #1E293B", padding:"12px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:700, color:"#F1F5F9" }}>Migration POC Environment</div>
          <div style={{ fontSize:11, color:"#475569" }}>CRM Legacy → Modern CRM · 3 sources · 4 destination tables</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" }}>
          <Badge text="Source: crm_db (SQLite)" color="#3B82F6"/>
          <Badge text="Source: price_excel" color="#22C55E"/>
          <Badge text="Source: contracts (DOCX)" color="#F59E0B"/>
          <span style={{ color:"#475569", fontSize:11 }}>→</span>
          <Badge text="Destination: Modern CRM" color="#8B5CF6"/>
        </div>
      </div>

      {/* Notification */}
      {notify && (
        <div style={{
          position:"fixed", top:16, right:16, padding:"10px 18px", borderRadius:8, zIndex:999,
          background:"#14532D", border:"1px solid #22C55E", color:"#86EFAC", fontSize:13, fontWeight:600
        }}>{notify}</div>
      )}

      {/* Tabs */}
      <div style={{ background:"#0F172A", borderBottom:"1px solid #1E293B", display:"flex", padding:"0 20px" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:"10px 18px", border:"none", cursor:"pointer", fontSize:13, fontWeight:600,
            background:"transparent",
            color: tab === t.id ? "#38BDF8" : "#64748B",
            borderBottom: tab === t.id ? "2px solid #38BDF8" : "2px solid transparent",
          }}>
            {t.label}
            {t.id === "mapping" && mappingSource !== "sample" && (
              <span style={{ marginLeft:6, fontSize:10, padding:"1px 6px", borderRadius:9999, background:"#22C55E33", color:"#22C55E" }}>
                {mappingSource}
              </span>
            )}
          </button>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8, paddingRight:4 }}>
          <span style={{ fontSize:11, color:"#475569" }}>Active mapping:</span>
          <span style={{ fontSize:11, color:"#94A3B8", fontWeight:600 }}>
            {mappings.length} entries · {[...new Set(mappings.map(m=>m.dst_table))].length} tables
          </span>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ background:"#020617" }}>
        {tab === "explorer"  && <DataExplorer/>}
        {tab === "mapping"   && <MappingViewer mappings={mappings}/>}
        {tab === "workshop"  && <MappingWorkshop onMappingsLoaded={handleMappingsLoaded}/>}
      </div>
    </div>
  );
}