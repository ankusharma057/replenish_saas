import React, { useEffect, useState } from "react";
import Header from "./Header";
import Invoice from "./Invoice";
import { Form } from "react-bootstrap";

export default function InvoiceList({ userProfile }) {
  const [finalizedInvoiceList, setFinalizedInvoiceList] = useState([]);
  const [nonFinalizedInvoiceList, setNonFinalizedInvoiceList] = useState([]);
  const [invoiceList, setInvoiceList] = useState({
    finalizedInvoiceList: [],
    nonFinalizedInvoiceList: [],
  });
  const [setselectList, setSetselectList] = useState("nonFinalizedInvoiceList");
  useEffect(() => {
    const fiInvoiceList = [];
    const nonFiInvoiceList = [];
    // Fetch the invoice list from the API
    fetch("/api/invoices")
      .then((response) => response.json())
      .then((data) => {
        data.forEach((invoice) => {
          if (invoice.is_finalized == true) {
            fiInvoiceList.push(invoice);
          } else {
            nonFiInvoiceList.push(invoice);
          }
        });

        setInvoiceList({
          finalizedInvoiceList: fiInvoiceList,
          nonFinalizedInvoiceList: nonFiInvoiceList,
        });
        // setFinalizedInvoiceList(fiInvoiceList);
        // setNonFinalizedInvoiceList(nonFiInvoiceList);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []); // Empty dependency array to run the effect only once

  return (
    <div>
      <Header userProfile={userProfile} />
      <br />
      <div className="flex justify-content-center">
        <div className="w-full sm:w-1/2 md:w-1/4">
          <Form.Select
            defaultValue={setselectList}
            size="md"
            aria-label="Default select example"
            onChange={(e) => setSetselectList(e.target.value)}
          >
            <option value={"finalizedInvoiceList"}>Finalized Invoices</option>
            <option value="nonFinalizedInvoiceList">
              Non Finalized Invoices
            </option>
          </Form.Select>
        </div>
      </div>
      <div>
        <hr />

        <div className="justify-center flex flex-wrap gap-3">
          {invoiceList[setselectList]?.sort((a, b) => a?.id - b?.id)?.map((invoice, i) => (
            <Invoice invoice={invoice} key={i} fiInvoiceList={invoice?.is_finalized} userProfile={userProfile} />
          ))}
        </div>
      </div>
      <br />
    </div>
  );
}
