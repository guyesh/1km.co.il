import { useEffect } from 'react';
import { fetchPendingEdits, fetchProtest, fetchUser, setEditAsViewed } from '../../api';
import React, { useState } from 'react';
import { formatDate } from '../../utils';
import { SidebarWrapper, SidebarList } from './components';
import styled from 'styled-components/macro';
import Button from '../../components/Button';
function getFieldName(fieldKey) {
  switch (fieldKey) {
    case 'displayName':
      return 'שם המקום';
    case 'streetAddress':
      return 'כתובת';
    case 'coords':
      return 'קואורדינטות';
    case 'whatsAppLink':
      return 'לינק לוואצאפ';
    case 'telegramLink':
      return 'לינק לטלגרם';
    case 'notes':
      return 'הערות';
    case 'dateTimeList':
      return 'תאריך ושעה';
    default:
      return '';
  }
}

function EditField({ diff, keyName, type }) {
  const value = (diff[keyName] || {})[type];

  switch (keyName) {
    case 'dateTimeList':
      return value.map((dt) => (
        <div key={`${dt.date}-${dt.time}`}>
          {formatDate(dt.date)} - {dt.time}
        </div>
      ));
    default:
      return <div>{value}</div>;
  }
}

function EditRow({ created_at, diff = {}, userId, protestId, id }) {
  const [expanded, setExpanded] = useState(false);
  const [protest, setProtest] = useState(null);
  const [user, setUser] = useState(null);
  const [viewed, setViewed] = useState(false);

  useEffect(() => {
    if (expanded) {
      fetchProtest(protestId).then((p) => {
        console.log(protestId);
        if (p) {
          setProtest(p);
        }
      });

      fetchUser(userId).then((u) => {
        console.log(u);
        if (u) {
          setUser(u);
        }
      });
    }
  }, [expanded, protestId, userId]);

  if (viewed) {
    return null;
  }

  return (
    <ProtestEditCard>
      <div style={{ display: 'flex', alignItems: 'right', width: '80%' }}>
        <DataField>
          <b>נוצר בתאריך: </b>
          {formatDate(created_at.toDate())}
        </DataField>
        {Object.keys(diff).map((key) => (
          <DataField key={key}>
            <div style={{ marginBottom: '8px' }}>
              <b>{getFieldName(key)}</b>
            </div>
            <div style={{ paddingRight: '10px' }}>
              <span style={{ textDecoration: 'line-through' }}>
                <EditField keyName={key} diff={diff} type="oldValue" />
              </span>
              <span>
                <EditField keyName={key} diff={diff} type="newValue" />
              </span>
            </div>
          </DataField>
        ))}
      </div>

      <div style={{ marginTop: '10px' }}>
        <ButtonsEditCards
          onClick={() => {
            setExpanded(true);
          }}
          color="#20B5F3"
        >
          פרטים נוספים
        </ButtonsEditCards>
        <ButtonsEditCards
          onClick={() => {
            setEditAsViewed(id);
            setViewed(true);
          }}
          color="#78C531"
        >
          אישור שינוי
        </ButtonsEditCards>
      </div>
      {expanded && protest && user && (
        <div>
          {JSON.stringify(protest)} + {JSON.stringify(user)}
        </div>
      )}
    </ProtestEditCard>
  );
}

async function _fetchPendingEdits(setEdits) {
  const result = await fetchPendingEdits();
  setEdits(result);
}

function useFetchEdits() {
  const [edits, setEdits] = useState(null);

  useEffect(() => {
    _fetchPendingEdits(setEdits);
  }, []);

  return {
    edits,
  };
}
export default function EditsAdmin() {
  const { edits } = useFetchEdits();
  if (!edits) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarWrapper>
      <SidebarList>
        {edits.map((edit) => (
          <EditRow {...edit} key={edit.uid} />
        ))}
      </SidebarList>
    </SidebarWrapper>
  );
}
const ProtestEditCard = styled.div`
  background-color: #fff;
  padding: 15px;
  display: list-item;
  align-items: center;
  position: relative;
  cursor: pointer;

  @media (max-width: 1340px) {
    flex-direction: rows;
    /* align-items: flex-start; */
  }
`;
const ButtonsEditCards = styled(Button)`
  display: inline-block;
  max-width: 150px;
  font-size: 14px;
  margin: 0px 5px;
`;
const DataField = styled.div`
  padding: '16px';
  width: 100%;
  display: block;
`;
