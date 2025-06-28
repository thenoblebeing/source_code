import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import companyService from '../services/companyService';

// Styled link component for buttons
const StyledButtonLink = styled(Link)`
  display: inline-block;
  background: linear-gradient(135deg, var(--terracotta), var(--soft-gold));
  color: var(--deep-charcoal);
  font-weight: 600;
  padding: 1rem 2rem;
  border-radius: 4px;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }
`;

const PageContainer = styled.main`
  width: 100%;
  overflow-x: hidden;
  background-color: var(--deep-charcoal);
  color: white;
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 5rem 2rem;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
`;

const SectionHeading = styled(motion.h2)`
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin-bottom: 2.5rem;
  text-align: center;
  color: var(--soft-gold);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -0.8rem;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: var(--terracotta);
  }
`;

const StoryContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const StoryImage = styled(motion.div)`
  width: 100%;
  height: 500px;
  background-image: url("/NobleBeingLOGO.jpg");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-color: #fff;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  padding: 2rem;
`;

const StoryText = styled.div`
  color: var(--sandstone-beige);
`;

const Paragraph = styled(motion.p)`
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
`;

const MissionSection = styled.section`
  background-color: rgba(30, 30, 30, 0.03);
  background: linear-gradient(135deg, rgba(40, 40, 40, 0.02) 0%, rgba(30, 30, 30, 0.05) 100%);
  color: var(--deep-charcoal);
  padding: 5rem 0;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const HighlightText = styled(motion.h2)`
  font-family: 'Playfair Display', serif;
  font-size: clamp(3rem, 8vw, 5rem);
  text-align: center;
  margin-bottom: 3rem;
  background: linear-gradient(to right, var(--terracotta), var(--sage-green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  padding-bottom: 1rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: var(--deep-charcoal);
  }
`;

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;
  margin-top: 4rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ValueCard = styled(motion.div)`
  background: white;
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background: var(--terracotta);
  }
`;

const ValueTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--deep-charcoal);
  font-weight: 600;
`;

const ValueText = styled.p`
  font-size: 1.05rem;
  line-height: 1.7;
  color: #555;
`;

// Team components will be used in Phase 6: Launch Preparation - Team Page
const TeamSection = styled.section`
  background-color: var(--deep-charcoal);
  padding: 5rem 0;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;
  margin-top: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const TeamMember = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
`;

const MemberImage = styled.div`
  height: 280px;
  width: 100%;
  background-color: #333;
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50%;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  }
`;

const MemberInfo = styled.div`
  padding: 1.5rem 2rem 2rem;
`;

const MemberName = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  color: var(--soft-gold);
  margin-bottom: 0.5rem;
`;

const MemberRole = styled.p`
  font-size: 0.95rem;
  color: var(--terracotta);
  margin-bottom: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const MemberBio = styled.p`
  font-size: 1rem;
  color: var(--sandstone-beige);
  line-height: 1.6;
`;

// Additional Team Section Styled Components
const TeamMemberCard = styled(motion.div)`
  background: rgba(25, 25, 25, 0.8);
  border-radius: 10px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 35px rgba(138, 154, 91, 0.2);
  }
`;  

const MemberImageContainer = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--terracotta);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const MemberImageContent = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--sage-green), var(--terracotta));
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 2rem;
  
  &::after {
    content: '${props => props.initial || "TN"}';
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 3rem;
  grid-column: span 2;
  
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

// Join Our Journey styled components
const JoinUsSection = styled.section`
  background: linear-gradient(135deg, var(--deep-charcoal), #1a1a1a);
  padding: 5rem 0;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, var(--terracotta), var(--sage-green), var(--soft-gold));
  }
`;

const JoinHeading = styled(SectionHeading)`
  margin-bottom: 1.5rem;
`;

const JoinParagraph = styled.p`
  font-size: 1.2rem;
  color: var(--sandstone-beige);
  max-width: 700px;
  margin: 0 auto 2.5rem;
  line-height: 1.7;
`;

const CtaButton = styled(motion.div)`
  display: inline-block;
`;

const JoinSection = styled.section`
  background: linear-gradient(to right, var(--deep-charcoal), #1a1a1a);
  padding: 5rem 0;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50px;
    left: -50px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: rgba(217, 194, 166, 0.05);
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -100px;
    right: -100px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: rgba(141, 163, 135, 0.05);
    z-index: 0;
  }
`;

const JoinButton = styled(motion.button)`
  background-color: var(--terracotta);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  margin-top: 2rem;
  box-shadow: 0 5px 15px rgba(226, 114, 91, 0.4);
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  z-index: 2;
  position: relative;
  
  &:hover {
    background-color: #d1604c;
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(226, 114, 91, 0.5);
  }
`;

const AboutPage = () => {
  const [companyStory, setCompanyStory] = useState(null);
  const [missionValues, setMissionValues] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState({
    story: true,
    mission: true,
    team: true
  });
  const [error, setError] = useState(null);

  // Fetch company data from API
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        // Set up timeout to prevent infinite loading states
        const timeoutId = setTimeout(() => {
          setLoading({
            story: false,
            mission: false,
            team: false
          });
        }, 5000); // 5 second timeout
        
        try {
          // Fetch company story
          const storyData = await companyService.getCompanyStory();
          setCompanyStory(storyData);
          setLoading(prev => ({ ...prev, story: false }));
        } catch (storyError) {
          console.warn('Unable to fetch company story, using fallback', storyError);
          setLoading(prev => ({ ...prev, story: false }));
        }

        try {
          // Fetch mission and values
          const missionData = await companyService.getMissionValues();
          setMissionValues(missionData);
          setLoading(prev => ({ ...prev, mission: false }));
        } catch (missionError) {
          console.warn('Unable to fetch mission values, using fallback', missionError);
          setLoading(prev => ({ ...prev, mission: false }));
        }

        try {
          // Fetch team members
          const teamData = await companyService.getTeamMembers();
          setTeamMembers(teamData);
          setLoading(prev => ({ ...prev, team: false }));
        } catch (teamError) {
          console.warn('Unable to fetch team members, using fallback', teamError);
          setLoading(prev => ({ ...prev, team: false }));
        }
        
        // Clear timeout if all requests complete
        clearTimeout(timeoutId);
        
      } catch (error) {
        console.error('Error fetching company data:', error);
        setError('Unable to connect to our servers. Showing you our local content instead.');
        setLoading({
          story: false,
          mission: false,
          team: false
        });
      }
    };

    fetchCompanyData();
  }, []);

  // Fallback data in case the API is not available
  const fallbackStory = {
    title: 'Our Story',
    content: 'TheNobleBeing was founded in 2020 with a mission to blend traditional craftsmanship with modern design. Our journey began when our founder visited rural artisan communities and witnessed the incredible skill and heritage being lost to mass production.'
  };

  const fallbackMission = {
    title: 'Our Mission',
    content: 'We are committed to preserving traditional craft techniques while creating sustainable, ethical fashion. Every piece in our collection tells a story of heritage, craftsmanship, and environmental consciousness.'
  };

  const fallbackTeam = [
    {
      id: 1,
      name: 'John Peter Noble',
      role: 'Co-Founder & Creative Director',
      bio: 'John combines artistic vision with strategic leadership, overseeing product development and ensuring every piece reflects TheNobleBeing\'s commitment to exceptional craftsmanship and sustainable design.'
    },
    {
      id: 2,
      name: 'Mahamad Suhail',
      role: 'Co-Founder & Technical Director',
      bio: 'Suhail architects the digital foundation of TheNobleBeing, managing web development and backend infrastructure while ensuring seamless user experiences across all platforms.'
    },
    {
      id: 3,
      name: 'Joel Peter Noble',
      role: 'Head of Operations & Quality Assurance',
      bio: 'Joel ensures operational excellence by maintaining quality standards, streamlining production processes, and coordinating between design and manufacturing teams.'
    },
    {
      id: 4,
      name: 'Sujith Yakkala',
      role: 'Marketing Director & Brand Strategist',
      bio: 'Sujith drives brand awareness and customer engagement through innovative marketing campaigns, social media strategy, and building meaningful connections with our community.'
    }
  ];

  return (
    <PageContainer>
      {/* Story Section */}
      <section>
        <SectionContainer>
          <SectionHeading
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Our Story
          </SectionHeading>
          
          <StoryContent>
            <StoryImage
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            
            <StoryText>
              {loading.story ? (
                <div className="loading-container">
                  <p>Loading our story...</p>
                </div>
              ) : (
                <>
                  <Paragraph
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {companyStory?.content || fallbackStory.content}
                  </Paragraph>
                  
                  <Paragraph
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    We decided to create a bridge between these skilled artisans and conscious consumers, 
                    developing a brand that celebrates the beauty of handmade items while ensuring 
                    sustainable practices and fair compensation for the makers.
                  </Paragraph>
                </>
              )}
            </StoryText>
          </StoryContent>
        </SectionContainer>
      </section>

      {/* Mission Section */}
      <MissionSection>
        <SectionContainer>
          <HighlightText
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Wear Your Worth
          </HighlightText>
          
          <Paragraph
            style={{ 
              maxWidth: '800px', 
              margin: '0 auto 3rem',
              textAlign: 'center',
              fontSize: '1.2rem',
              color: 'var(--text-primary)'
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            We believe in sustainable, handcrafted clothing that reflects the worth of both its makers and wearers. 
            Our mission is to create pieces that stand at the intersection of tradition and innovation, 
            celebrating the human touch while embracing technological advancements that enhance the experience of fashion.
          </Paragraph>
          
          <ValuesGrid>
            <ValueCard
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -10, boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)' }}
            >
              <ValueTitle>Sustainability</ValueTitle>
              <ValueText>
                We prioritize eco-friendly materials and ethical production processes, ensuring that our 
                environmental footprint remains as light as possible. Each garment is created with respect for 
                the planet and its resources.
              </ValueText>
            </ValueCard>
            
            <ValueCard
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -10, boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)' }}
            >
              <ValueTitle>Craftsmanship</ValueTitle>
              <ValueText>
                Every piece in our collection is crafted with meticulous attention to detail, honoring 
                traditional techniques while infusing them with contemporary vision. Our artisans bring decades 
                of expertise to each creation.
              </ValueText>
            </ValueCard>
            
            <ValueCard
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -10, boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)' }}
            >
              <ValueTitle>Innovation</ValueTitle>
              <ValueText>
                From our virtual try-on technology to our unique designs, we continuously seek new ways 
                to enhance the experience of fashion. We embrace the future while honoring the past.
              </ValueText>
            </ValueCard>
            
            <ValueCard
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ y: -10, boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)' }}
            >
              <ValueTitle>Individuality</ValueTitle>
              <ValueText>
                We celebrate the unique identity of each person who wears our creations, designing 
                pieces that allow for self-expression and personal style. Our fashion helps you tell your story.
              </ValueText>
            </ValueCard>
          </ValuesGrid>
        </SectionContainer>
      </MissionSection>

      {/* Team Section */}
      <TeamSection>
        <SectionContainer>
          <SectionHeading
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            The Minds Behind TheNobleBeing
          </SectionHeading>
          
          <TeamGrid>
            {loading.team ? (
              <LoadingContainer>
                <Paragraph>Loading our team...</Paragraph>
              </LoadingContainer>
            ) : teamMembers.length > 0 ? (
              teamMembers.map(member => (
                <TeamMemberCard 
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <MemberImageContainer>
                    {member.image ? (
                      <MemberImageContent src={member.image} alt={member.name} />
                    ) : (
                      <PlaceholderImage initial={member.name.charAt(0)} />
                    )}
                  </MemberImageContainer>
                  <MemberName>{member.name}</MemberName>
                  <MemberRole>{member.role}</MemberRole>
                  <MemberBio>{member.bio}</MemberBio>
                </TeamMemberCard>
              ))
            ) : (
              fallbackTeam.map((member, index) => (
                <TeamMemberCard 
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <MemberImageContainer>
                    <PlaceholderImage initial={member.name.charAt(0)} />
                  </MemberImageContainer>
                  <MemberName>{member.name}</MemberName>
                  <MemberRole>{member.role}</MemberRole>
                  <MemberBio>{member.bio}</MemberBio>
                </TeamMemberCard>
              ))
            )}
          </TeamGrid>
        </SectionContainer>
      </TeamSection>

      {/* Join Us Section */}
      <JoinUsSection>
        <SectionContainer>
          <JoinHeading
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Join Our Journey
          </JoinHeading>
          <JoinParagraph>
            We're always looking for passionate individuals to join our team, from designers and artisans 
            to tech innovators and sustainability advocates.
          </JoinParagraph>
          <CtaButton
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <StyledButtonLink to="/contact">Get in Touch</StyledButtonLink>
          </CtaButton>
        </SectionContainer>
      </JoinUsSection>
    </PageContainer>
  );
};

export default AboutPage;
