package com.koipond.backend.service;

import com.koipond.backend.dto.*;
import com.koipond.backend.model.*;
import com.koipond.backend.repository.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;



import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private DesignRepository designRepository;
    @Mock
    private PromotionRepository promotionRepository;
    @Mock
    private ProjectStatusRepository projectStatusRepository;
    @Mock
    private ProjectCancellationRepository projectCancellationRepository;

    @InjectMocks
    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAllProjects_ReturnsListOfProjectDTOs() {
        // Arrange
        Project project1 = new Project();
        project1.setId("1");
        project1.setName("Project 1");
        Project project2 = new Project();
        project2.setId("2");
        project2.setName("Project 2");
        when(projectRepository.findAll()).thenReturn(Arrays.asList(project1, project2));

        // Act
        List<ProjectDTO> result = projectService.getAllProjects();

        // Assert
        assertEquals(2, result.size());
        assertEquals("Project 1", result.get(0).getName());
        assertEquals("Project 2", result.get(1).getName());
    }

    @Test
    void createProject_SuccessfulCreation() {
        // Arrange
        CreateProjectRequest request = new CreateProjectRequest();
        request.setName("New Project");
        request.setCustomerId("customerId");
        request.setDesignId("designId");
        request.setPromotionId("promotionId");
        
        User consultant = new User();
        consultant.setId("consultantId");
        User customer = new User();
        customer.setId("customerId");
        Design design = new Design();
        design.setId("designId");
        Promotion promotion = new Promotion();
        promotion.setId("promotionId");
        ProjectStatus pendingStatus = new ProjectStatus();
        pendingStatus.setName("PENDING");

        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(consultant));
        when(userRepository.findById("customerId")).thenReturn(Optional.of(customer));
        when(designRepository.findById("designId")).thenReturn(Optional.of(design));
        when(promotionRepository.findById("promotionId")).thenReturn(Optional.of(promotion));
        when(projectStatusRepository.findByName("PENDING")).thenReturn(Optional.of(pendingStatus));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project savedProject = invocation.getArgument(0);
            savedProject.setId("newProjectId");
            return savedProject;
        });

        // Act
        ProjectDTO result = projectService.createProject(request, "consultantUsername");

        // Assert
        assertNotNull(result);
        assertEquals("New Project", result.getName());
        assertEquals("newProjectId", result.getId());
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void getProjectsByConsultant_ReturnsListOfProjectDTOs() {
        // Arrange
        String consultantUsername = "consultant1";
        User consultant = new User();
        consultant.setId("consultantId");
        consultant.setUsername(consultantUsername);
        
        Project project1 = new Project();
        project1.setId("1");
        project1.setName("Project 1");
        project1.setConsultant(consultant);
        
        Project project2 = new Project();
        project2.setId("2");
        project2.setName("Project 2");
        project2.setConsultant(consultant);
        
        when(userRepository.findByUsername(consultantUsername)).thenReturn(Optional.of(consultant));
        when(projectRepository.findByConsultantId(consultant.getId())).thenReturn(Arrays.asList(project1, project2));

        // Act
        List<ProjectDTO> result = projectService.getProjectsByConsultant(consultantUsername);

        // Assert
        assertEquals(2, result.size());
        assertEquals("Project 1", result.get(0).getName());
        assertEquals("Project 2", result.get(1).getName());
    }

    @Test
    void updateProject_SuccessfulUpdate() {
        // Arrange
        String projectId = "projectId";
        String consultantUsername = "consultant1";
        UpdateProjectRequest request = new UpdateProjectRequest();
        request.setName("Updated Project");
        request.setDescription("New description");

        Project existingProject = new Project();
        existingProject.setId(projectId);
        existingProject.setName("Old Project");
        existingProject.setDescription("Old description");
        User consultant = new User();
        consultant.setUsername(consultantUsername);
        existingProject.setConsultant(consultant);

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(existingProject));
        when(projectRepository.save(any(Project.class))).thenReturn(existingProject);

        // Act
        ProjectDTO result = projectService.updateProject(projectId, request, consultantUsername);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Project", result.getName());
        assertEquals("New description", result.getDescription());
        verify(projectRepository).save(existingProject);
    }

    @Test
    void updateProjectStatus_SuccessfulUpdate() {
        // Arrange
        String projectId = "projectId";
        String newStatus = "APPROVED";
        String username = "manager1";
        boolean isManager = true;

        Project existingProject = new Project();
        existingProject.setId(projectId);
        ProjectStatus currentStatus = new ProjectStatus();
        currentStatus.setName("PENDING");
        existingProject.setStatus(currentStatus);

        ProjectStatus newProjectStatus = new ProjectStatus();
        newProjectStatus.setName(newStatus);

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(existingProject));
        when(projectStatusRepository.findByName(newStatus)).thenReturn(Optional.of(newProjectStatus));
        when(projectRepository.save(any(Project.class))).thenReturn(existingProject);

        // Act
        ProjectDTO result = projectService.updateProjectStatus(projectId, newStatus, username, isManager);

        // Assert
        assertNotNull(result);
        assertEquals(newStatus, result.getStatusName());
        verify(projectRepository).save(existingProject);
    }

    @Test
    void cancelProject_SuccessfulCancellation() {
        // Arrange
        String projectId = "projectId";
        String username = "consultant1";
        boolean isManager = false;
        CancelProjectRequest request = new CancelProjectRequest();
        request.setReason("Project cancelled due to budget constraints");

        Project existingProject = new Project();
        existingProject.setId(projectId);
        existingProject.setActive(true);
        User consultant = new User();
        consultant.setUsername(username);
        existingProject.setConsultant(consultant);

        ProjectStatus cancelledStatus = new ProjectStatus();
        cancelledStatus.setName("CANCELLED");

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(existingProject));
        when(projectStatusRepository.findByName("CANCELLED")).thenReturn(Optional.of(cancelledStatus));
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(consultant));
        when(projectRepository.save(any(Project.class))).thenReturn(existingProject);
        when(projectCancellationRepository.save(any(ProjectCancellation.class))).thenReturn(new ProjectCancellation());

        // Act
        ProjectDTO result = projectService.cancelProject(projectId, request, username, isManager);

        // Assert
        assertNotNull(result);
        assertFalse(result.isActive());
        assertEquals("CANCELLED", result.getStatusName());
        verify(projectRepository).save(existingProject);
        verify(projectCancellationRepository).save(any(ProjectCancellation.class));
    }


}
