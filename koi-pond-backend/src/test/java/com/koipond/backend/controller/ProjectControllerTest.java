package com.koipond.backend.controller;

import com.koipond.backend.dto.*;
import com.koipond.backend.service.ProjectService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class ProjectControllerTest {

    @Mock
    private ProjectService projectService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ProjectController projectController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAllProjects_ReturnsListOfProjects() {
        List<ProjectDTO> expectedProjects = Arrays.asList(new ProjectDTO(), new ProjectDTO());
        doReturn(expectedProjects).when(projectService).getAllProjects();

        ResponseEntity<List<ProjectDTO>> response = projectController.getAllProjects();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedProjects, response.getBody());
    }

    @Test
    void getConsultantProjects_ReturnsListOfProjects() {
        String consultantUsername = "consultant1";
        List<ProjectDTO> expectedProjects = Arrays.asList(new ProjectDTO(), new ProjectDTO());
        doReturn(consultantUsername).when(authentication).getName();
        doReturn(expectedProjects).when(projectService).getProjectsByConsultant(consultantUsername);

        ResponseEntity<List<ProjectDTO>> response = projectController.getConsultantProjects(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedProjects, response.getBody());
    }

    @Test
    void createProject_ReturnsCreatedProject() {
        CreateProjectRequest request = new CreateProjectRequest();
        String consultantUsername = "consultant1";
        ProjectDTO createdProject = new ProjectDTO();
        doReturn(consultantUsername).when(authentication).getName();
        doReturn(createdProject).when(projectService).createProject(request, consultantUsername);

        ResponseEntity<ProjectDTO> response = projectController.createProject(request, authentication);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(createdProject, response.getBody());
    }

    @Test
    void updateProject_ReturnsUpdatedProject() {
        String projectId = "project1";
        UpdateProjectRequest request = new UpdateProjectRequest();
        String consultantUsername = "consultant1";
        ProjectDTO updatedProject = new ProjectDTO();
        doReturn(consultantUsername).when(authentication).getName();
        doReturn(updatedProject).when(projectService).updateProject(projectId, request, consultantUsername);

        ResponseEntity<ProjectDTO> response = projectController.updateProject(projectId, request, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(updatedProject, response.getBody());
    }




    @Test
    void cancelProject_AsManager_ReturnsCancelledProject() {
        String projectId = "project1";
        CancelProjectRequest request = new CancelProjectRequest();
        String username = "manager1";
        ProjectDTO cancelledProject = new ProjectDTO();
        doReturn(username).when(authentication).getName();
        doReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_1"))).when(authentication).getAuthorities();
        doReturn(cancelledProject).when(projectService).cancelProject(eq(projectId), eq(request), eq(username), eq(true));

        ResponseEntity<ProjectDTO> response = projectController.cancelProject(projectId, request, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(cancelledProject, response.getBody());
    }

    @Test
    void cancelProject_AsConsultant_ReturnsCancelledProject() {
        String projectId = "project1";
        CancelProjectRequest request = new CancelProjectRequest();
        String username = "consultant1";
        ProjectDTO cancelledProject = new ProjectDTO();
        doReturn(username).when(authentication).getName();
        doReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_2"))).when(authentication).getAuthorities();
        doReturn(cancelledProject).when(projectService).cancelProject(eq(projectId), eq(request), eq(username), eq(false));

        ResponseEntity<ProjectDTO> response = projectController.cancelProject(projectId, request, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(cancelledProject, response.getBody());
    }
}
