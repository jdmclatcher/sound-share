import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import HomeScreen from "./src/screens/Home";
import ProfileScreen from "./src/screens/Profile";
import SearchScreen from "./src/screens/Search";
import AddReview from "./src/screens/AddReview";
import ReviewScreen from "./src/screens/Reviews";
import ArtistProfileScreen from "./src/screens/ArtistProfile";
import FindUsers from "./src/screens/FindUsers";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            display: "flex",
            backgroundColor: "#04A777", 
          },
          tabBarActiveTintColor: "#FFFFFF", 
          tabBarInactiveTintColor: "#CCCCCC", 
          headerStyle: {
            backgroundColor: "#04A777",
          },
          headerTintColor: "#FFFFFF",
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="magnify"
                color={color}
                size={size}
              />
            ),
          }}
        />
        {/* <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account"
                color={color}
                size={size}
              />
            ),
          }}
        /> */}
        <Tab.Screen
          name="Reviews"
          component={ReviewScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="star" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Find Users"
          component={FindUsers}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Artist Profile"
          component={ArtistProfileScreen}
          options={{
            tabBarButton: () => null,
            title: "Artist Profile", 
          }}
        />
        <Tab.Screen
          name="AddReview"
          component={AddReview}
          options={{
            tabBarButton: () => null,
            title: "Add Review", 
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
