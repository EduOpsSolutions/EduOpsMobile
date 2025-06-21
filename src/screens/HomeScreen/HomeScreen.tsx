import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './Homescreen.styles'; 
const {width} = Dimensions.get('window');

interface PostProps {
  id: string;
  author: string;
  department: string;
  timeAgo: string;
  title: string;
  content: string;
  avatar: string;
}

const PostCard: React.FC<PostProps> = ({
  author,
  department,
  timeAgo,
  title,
  content,
  avatar,
}) => {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{uri: avatar}} style={styles.avatar} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{author}</Text>
          <Text style={styles.department}>{department}</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
            <Icon name="public" size={12} color="#666" style={styles.publicIcon} />
          </View>
        </View>
      </View>
      <Text style={styles.postTitle}>{title}</Text>
      <Text style={styles.postContent}>
        {content}{' '}
      </Text>
    </View>
  );
};

export const HomeScreen = (): React.JSX.Element => {
  const posts: PostProps[] = [
    {
      id: '1',
      author: 'John Carlo',
      department: 'Department Office',
      timeAgo: '2 hours ago',
      title: 'Test Post',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam...',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    },
    {
      id: '2',
      author: 'John Carlo',
      department: 'Department Office',
      timeAgo: '3 hours ago',
      title: 'Test Post',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam...',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    },
    {
      id: '3',
      author: 'John Carlo',
      department: 'Department Office',
      timeAgo: '5 hours ago',
      title: 'Test Post',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam...',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#de0000" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/sprachins-logo-3.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="notifications" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton}>
              <Text style={styles.profileText}>PD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        <View style={styles.postsContainer}>
          {posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color="#de0000" />
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="school" size={24} color="#666" />
          <Text style={styles.navText}>Enrollment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="grade" size={24} color="#666" />
          <Text style={styles.navText}>Grades</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="payment" size={24} color="#666" />
          <Text style={styles.navText}>Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="description" size={24} color="#666" />
          <Text style={styles.navText}>Documents</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};