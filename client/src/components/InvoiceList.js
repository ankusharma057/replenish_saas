import React, { useEffect, useState } from "react";
import Header from "./Header";
import Invoice from "./Invoice";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';

export default function InvoiceList({ userProfile }) {

  const [invoiceList, setInvoiceList] = useState({
    finalizedInvoiceList: [],
    nonFinalizedInvoiceList: [],
  });
  const [radioValue, setRadioValue] = useState('1');

  const [setselectList, setSetselectList] = useState("nonFinalizedInvoiceList");
  useEffect(() => {
    const fiInvoiceList = [];
    const nonFiInvoiceList = [];
    // Fetch the invoice list from the API
    fetch("/api/invoices")
      .then((response) => response.json())
      .then((data) => {
        data?.forEach((invoice) => {
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



  const radios = [
    { name: 'Non Finalized Invoices', value: '1' },
    { name: 'Finalized Invoices', value: '2' },
  ];

  return (
    <div>
      <Header userProfile={userProfile} />
      <br />
      <div className="flex justify-content-center">
        <div className="w-full flex justify-center">

          <ButtonGroup className="mb-2  border w-full md:w-auto border-gray-200 p-3 ">
            {radios.map((radio, idx) => (
              <ToggleButton
                key={idx}
                id={`radio-${idx}`}
                type="radio"
                className={`${radioValue === radio.value ? 'btn-blue' : 'btn-white'} toggle-button `}
                name="radio"
                style={{
                  borderTopLeftRadius: idx === 0 && radioValue === radio.value ? '0' : '1rem',
                  borderBottomLeftRadius: idx === 0 && radioValue === radio.value ? '0' : '1rem',
                  borderTopRightRadius: idx === radios.length - 1 && radioValue === radio.value ? '0' : '1rem',
                  borderBottomRightRadius: idx === radios.length - 1 && radioValue === radio.value ? '0' : '1rem',
                }}
                value={radio.value}
                checked={radioValue === radio.value}
                onChange={(e) => {
                  setSetselectList(String(e.currentTarget.value) === "1" ? "nonFinalizedInvoiceList" : "finalizedInvoiceList")
                  setRadioValue(e.currentTarget.value)
                }}
              >
                {radio.name}
              </ToggleButton>
            ))}
          </ButtonGroup>

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
    </div >
  );
}
