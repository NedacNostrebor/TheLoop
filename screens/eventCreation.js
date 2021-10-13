import {
  ImageBackground,
  View,
  SafeAreaView,
  ScrollView,
  Keyboard,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Button } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import { Input } from "react-native-elements";
import { Text } from "react-native-elements";

import { globalStyles } from "../styles/global";
import * as yup from "yup";
import { Formik } from "formik";
import moment from "moment";
import { createEvent } from "../shared/firebaseMethods";

// Test to make sure that a selected date and time hasn't happened yet
function isFutureDate(ref, msg) {
  return this.test({
    name: "isFutureDate",
    exclusive: false,
    message: msg || "You cannot create an event in the past",
    params: {
      reference: ref.path,
    },
    test: function (value) {
      if (value == null || this.resolve(ref) == null) {
        return false;
      } else {
        return (
          moment(this.resolve(ref) + "T" + value).format("x") >
          moment().format("x")
        );
      }
    },
  });
}

yup.addMethod(yup.string, "isFutureDate", isFutureDate);

const CreateEventSchema = yup.object({
  eventName: yup.string().required("Please enter a name for your event"),
  eventLoop: yup.string().required("Please select a loop for your event"),
  eventDate: yup.string().required("Please select a date for your event"),
  eventTime: yup
    .string()

    .isFutureDate(yup.ref("eventDate"))
    .required("Please select a time for your event"),
  eventAddress: yup.string().required("Please enter an address for your event"),
});

export default function EventCreation({ navigation }) {
  const date = new Date();
  const [show, setShow] = useState(false);
  const [dateText, setDateText] = useState();
  const [timeText, setTimeText] = useState();
  const [mode, setMode] = useState("date");
  const [loop, setLoop] = useState();

  // from https://github.com/react-native-datetimepicker/datetimepicker

  const onConfirm = (selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');

    if (mode == "date") {
      setDateText(moment(currentDate).format("MMMM Do, YYYY"));
    }
    if (mode == "time") {
      setTimeText(moment(currentDate).format("hh:mm A"));
    }
  };

  const onCancel = () => {
    setShow(false);
  };

  const showMode = (currentMode) => {
    setMode(currentMode);
    setShow(true);
  };

  const showDatePicker = () => {
    showMode("date");
  };

  const showTimePicker = () => {
    showMode("time");
  };

  return (
<View style={{flex: 1, backgroundColor: '#F8F8F8'}}>

        <SafeAreaView style={globalStyles.container}>
          <View style={{ alignItems: "center" }}>

            <Formik
              initialValues={{
                eventName: "",
                eventLoop: "",
                eventDate: "",
                eventTime: "",
                eventAddress: "",
              }}
              validationSchema={CreateEventSchema}
              onSubmit={(values, actions) => {
                var success = createEvent(
                  values.eventName,
                  values.eventLoop,
                  // formats the date and time to be in milliseconds
                  moment(values.eventDate + " " + values.eventTime).format("x"),
                  values.eventAddress,
                  navigation
                );
                if (success) {
                  Alert.alert("Success!", "Event successfully created!");
                  actions.resetForm();
                }
              }}

            >
              {(props) => (
                <>
                <Text style={globalStyles.titleText}></Text>
                
                  <Input
                  textAlign= 'center'
                  placeholder="*Event Title*"
                  value={props.values.eventName}
                  onChangeText={props.handleChange("eventName")}
                  onBlur={props.handleBlur("eventName")}
                  />
                  <Text style={globalStyles.errorText}>
                    {props.touched.eventName && props.errors.eventName}
                  </Text>

                  {/* Touching the date button opens the date picker */}
                  <Button
                    titleStyle={{color: 'black'}}
                    buttonStyle={{borderWidth: 1, borderColor: 'black', titleColor: 'black', backgroundColor: 'transparent'}}
                    style={{padding: 10}}
                    title = {dateText || "Date"}
                    onPress={showDatePicker}
                  />
                  <Text style={globalStyles.errorText}>
                    {props.touched.eventDate && props.errors.eventDate}
                  </Text>

                  {/* and touching the time button opens the time picker */}

                  <Button
                    titleStyle={{color: 'black'}}
                    buttonStyle={{padding: 10, borderWidth: 1, borderColor: 'black', titleColor: 'black', backgroundColor: 'transparent'}}
                    style={{padding: 10}}
                    title = {timeText || "Time"}
                    onPress={showTimePicker}
                  />
                  <Text style={globalStyles.errorText}>
                    {props.touched.eventTime && props.errors.eventTime}
                  </Text>
                  {
                    <DateTimePickerModal
                      // value={date}
                      mode={mode}
                      isVisible={show}
                      display="spinner"
                      textColor = "black"
                      onConfirm={(date) => {
                        onConfirm(date);
                        // updates the date or time field value, depending on which one was selected
                        mode === "date" &&
                          props.setFieldValue(
                            "eventDate",
                            moment(date).format("YYYY-MM-DD")
                          );
                        mode === "time" &&
                          props.setFieldValue(
                            "eventTime",
                            moment(date).format("HH:mm:00ZZ")
                          );
                      }}
                      // onCancel is a required prop, so ignore this for now
                      onCancel={onCancel}
                    />
                  }

                  {/* <TextInput
                    style={globalStyles.input}
                    placeholder="Event Loop"
                    value={props.values.eventLoop}
                    onChangeText={props.handleChange("eventLoop")}
                    onBlur={props.handleBlur("eventLoop")}
                  /> */}

                  <View style={{ flexDirection: "row" }}>
                    <View style={{ flex: 1, paddingLeft: 5, paddingRight: 5 }}>
                      <TouchableOpacity
                        style={[
                          loop == "Sports"
                            ? styles.selectedLoop
                            : globalStyles.input,
                          { alignItems: "center" },
                        ]}
                        onPress={() => {
                          setLoop("Sports");
                          props.setFieldValue("eventLoop", "Sports");
                        }}
                      >
                        <Text>Sports</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1, paddingLeft: 5, paddingRight: 5 }}>
                      <TouchableOpacity
                        style={[
                          loop == "Music"
                            ? styles.selectedLoop
                            : globalStyles.input,
                          { alignItems: "center" },
                        ]}
                        onPress={() => {
                          setLoop("Music");
                          props.setFieldValue("eventLoop", "Music");
                        }}
                      >
                        <Text>Music</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1, paddingLeft: 5, paddingRight: 5 }}>
                      <TouchableOpacity
                        style={[
                          loop == "Volunteer"
                            ? styles.selectedLoop
                            : globalStyles.input,
                          { alignItems: "center" },
                        ]}
                        onPress={() => {
                          setLoop("Volunteer");
                          props.setFieldValue("eventLoop", "Volunteer");
                        }}
                      >
                        <Text>Volunteer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={globalStyles.errorText}>
                    {props.touched.eventLoop && props.errors.eventLoop}
                  </Text>
                  <Input
                    textAlign= 'center'
                    placeholder="Address"
                    value={props.values.eventAddress}
                    onChangeText={props.handleChange("eventAddress")}
                    onBlur={props.handleBlur("eventAddress")}
                  />
                  <Text style={globalStyles.errorText}>
                    {props.touched.eventAddress && props.errors.eventAddress}
                  </Text>
                  <View/>
                  <Button
                    title= "Create Event"
                    titleStyle={{fontSize: 30, color: 'black'}}
                    buttonStyle={{borderWidth: 1, borderColor: 'black', titleColor: 'black', backgroundColor: '#ff7b00'}}
                    style={{padding: 45}}
                    onPress={props.handleSubmit}
                  />
                </>
              )}
            </Formik>
          </View>
        </SafeAreaView>
      {/* </ImageBackground> */}
    </View>
  );
}

const styles = StyleSheet.create({
  selectedLoop: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    fontSize: 18,
    marginBottom: 10,
    borderRadius: 6,
    backgroundColor: "#ffab8a",
  },
});
