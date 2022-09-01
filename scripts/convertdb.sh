#!/bin/bash

#check if first one exists

# usage: convertdb.sh <new.db> <signal.db>
# table exists already
# wrong parameters

echo "Creating new database and copying data ..."

filename=$(basename -- "$1")
extension="${filename##*.}"
filename="${filename%.*}"
newdb="$filename"_web."$extension"


sqlite3 -batch "$newdb" ";"
sqlite3 -batch $1 <<EOF
BEGIN TRANSACTION;
ATTACH DATABASE "$newdb" As 'n';

CREATE TABLE n.sms_new(id integer primary key,id_prev,date,type,sender,body, quote_body,reaction,date_sent,date_seen_sender,date_seen_recipient);
INSERT INTO n.sms_new (id_prev,date,type,sender,body, quote_body,reaction,date_sent,date_seen_sender,date_seen_recipient)
  SELECT _id as id_prev, date, "SMS" as type, reply_path_present as sender, body, null as quote_body,null as reaction, date_sent, reactions_last_seen as date_seen_sender, receipt_timestamp as data_seen_recipient FROM sms;
INSERT INTO n.sms_new (id_prev,date,type,sender,body, quote_body,reaction,date_sent,date_seen_sender,date_seen_recipient)
  SELECT _id as id_prev, date, "MMS" as type, st as sender, body, quote_body, null as reaction, date_received, reactions_last_seen as date_seen_sender, receipt_timestamp as data_seen_recipient FROM mms;
update n.sms_new set reaction = (select emoji from reaction where reaction.message_id = n.sms_new.id_prev and ((n.sms_new.type = "SMS" and reaction.is_mms = 0) or (n.sms_new.type = "MMS" and reaction.is_mms = 1)));

update n.sms_new set date = (date - 1635876763738) / 1000;
update n.sms_new set date = datetime("2021-11-02 19:12:44.000", "+" || date || ". second");
update n.sms_new set date_sent = (date_sent - 1635876763738) / 1000;
update n.sms_new set date_sent = datetime("2021-11-02 19:12:44.000", "+" || date_sent || ". second");
update n.sms_new set date_seen_sender = (date_seen_sender - 1635876763738) / 1000;
update n.sms_new set date_seen_sender = datetime("2021-11-02 19:12:44.000", "+" || date_seen_sender || ". second");
update n.sms_new set date_seen_recipient = (date_seen_recipient - 1635876763738) / 1000;
update n.sms_new set date_seen_recipient = datetime("2021-11-02 19:12:44.000", "+" || date_seen_recipient || ". second");

CREATE TABLE n.sms(id integer primary key,id_prev,date,type,sender,body, quote_body,reaction,date_sent,date_seen_sender,date_seen_recipient);
INSERT INTO n.sms (id_prev,date,type,sender,body, quote_body,reaction,date_sent,date_seen_sender,date_seen_recipient)
  SELECT id_prev, date, type, sender, body, quote_body, reaction, date_sent, date_seen_sender, date_seen_recipient FROM n.sms_new order by date;
  
drop table n.sms_new;

COMMIT;
EOF

echo "Done! New database saved as $newdb"
